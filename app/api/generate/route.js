import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import EmailHistory from '@/lib/models/EmailHistory';
import { generateWithFallback } from '@/lib/ai/aiRouter';
import { auth } from '@/auth';
import { GenerateSchema, parseBody } from '@/lib/validation/schemas';
import logger, { logRequest, logResponse } from '@/lib/logger';
import { rateLimit, rateLimitHeaders } from '@/lib/rateLimit';

export async function POST(request) {
  const start = Date.now();
  logRequest(request, 'POST /api/generate');

  try {
    const session = await auth();
    const userId = session?.user?.id || null;

    // ── Per-user / per-IP rate limiting (Redis-backed, falls back to memory) ──
    const rateLimitKey = userId || request.headers.get('x-forwarded-for') || 'anonymous';
    const rl = await rateLimit(rateLimitKey, { limit: 20, windowSecs: 60 });
    if (!rl.allowed) {
      logResponse('POST /api/generate', 429, Date.now() - start);
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment before trying again.' },
        { status: 429, headers: rateLimitHeaders(rl) }
      );
    }

    // ── Zod validation ────────────────────────────────────────────────────────
    const raw = await request.json();
    const { success, error: validationError, data } = parseBody(GenerateSchema, raw);
    if (!success) {
      logResponse('POST /api/generate', 400, Date.now() - start);
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const { action, originalEmail, draftReply, tone, length, variations, useEmojis, inputLanguage } = data;

    const isImprove = action === 'improve';
    const isQuickReplies = action === 'quick-replies';

    // ── Quick Replies action ───────────────────────────────────────────────────
    if (isQuickReplies) {
      if (!originalEmail.trim()) {
        return NextResponse.json({ error: 'Please provide an email to analyze.' }, { status: 400 });
      }

      const prompt = `You are a smart email assistant. Analyze this email and suggest exactly 3 distinct, context-aware quick reply options.
Each option should represent a different intent/action the reader might want to take.

Return ONLY a valid JSON array with exactly 3 objects. No markdown, no explanation, no code fences. Just the raw JSON array.

Format:
[
  {"label": "Short action label (3-5 words)", "body": "Full polished reply text ready to send (2-4 sentences)"},
  {"label": "Short action label (3-5 words)", "body": "Full polished reply text ready to send (2-4 sentences)"},
  {"label": "Short action label (3-5 words)", "body": "Full polished reply text ready to send (2-4 sentences)"}
]

Examples of good labels: "Agree & Schedule", "Decline Politely", "Ask for More Info", "Accept the Offer", "Confirm Receipt"

Email to analyze:
${originalEmail.trim()}`;

      try {
        const result = await generateWithFallback(prompt);
        let raw = result.text.trim();
        if (raw.startsWith('```json')) raw = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        if (raw.startsWith('```')) raw = raw.replace(/^```\n?/, '').replace(/\n?```$/, '');
        const suggestions = JSON.parse(raw);
        logResponse('POST /api/generate', 200, Date.now() - start);
        return NextResponse.json({ suggestions }, { headers: rateLimitHeaders(rl) });
      } catch (err) {
        logger.error('Quick replies generation failed', { error: err.message });
        logResponse('POST /api/generate', 500, Date.now() - start);
        return NextResponse.json({ error: 'Failed to generate quick replies. Please try again.' }, { status: 500 });
      }
    }

    // ── Validation for improve / generate ────────────────────────────────────
    if (isImprove && !draftReply.trim()) {
      return NextResponse.json({ error: 'Please provide a draft reply to improve.' }, { status: 400 });
    }
    if (!isImprove && !originalEmail.trim()) {
      return NextResponse.json({ error: 'Please provide an original email.' }, { status: 400 });
    }

    // ── Build prompt ──────────────────────────────────────────────────────────
    let prompt = '';
    const numVariations = variations;

    if (isImprove) {
      prompt = `You are an expert email editor. Your task is to improve the provided drafted reply.
Check for grammar, spelling, clarity, tone, and professionalism.
If an original email is provided, check if the reply makes sense in context.
Preserve the user's original meaning and DO NOT invent any new information.
The input language is: ${inputLanguage}.
Translate and output the final polished reply in English.

You MUST return a JSON object with exactly these fields:
{
  "improvedReply": "The polished English version of the email",
  "mistakes": [
    {
      "original": "exact text that had a mistake",
      "correction": "corrected text",
      "explanation": "brief reason for the change"
    }
  ],
  "suggestions": [
    "string suggestion 1",
    "string suggestion 2"
  ]
}

Ensure the response is valid JSON. Do not include markdown code block syntax around the JSON (no \`\`\`json). Just return the raw JSON object.

Original Email (may be empty):
${originalEmail || ''}

Drafted Reply:
${draftReply.trim()}
`;
    } else {
      prompt = `You are a professional email assistant. Rewrite the following email as a reply in a ${tone} tone. `;
      if (length === 'shorter') prompt += 'Be highly concise and brief (1-3 sentences maximum). ';
      if (length === 'longer') prompt += 'Be detailed and thorough, expanding on points thoughtfully (multiple paragraphs). ';
      if (useEmojis) prompt += 'Naturally include relevant emojis throughout the text. ';
      else prompt += 'Do NOT use any emojis. ';

      if (numVariations > 1) {
        prompt += `\n\nCRITICAL INSTRUCTION: You must provide EXACTLY ${numVariations} completely distinct variations of the reply. Separate each variation strictly with this exact delimiter on a new line: |||VARIATION|||\nDo not include numbering like "Variation 1:" or markdown, just the raw text of each reply separated by the delimiter.`;
      } else {
        prompt += '\n\nReturn ONLY the reply text, no explanations, no markdown, no quotes around it.';
      }
      prompt += `\n\nOriginal email:\n${originalEmail.trim()}`;
    }

    // ── Call AI (Gemini → Groq → OpenRouter) ─────────────────────────────────
    let replyText;
    try {
      const result = await generateWithFallback(prompt);
      replyText = result.text;
      logger.info('AI generation success', { action, tone, userId: userId || 'anonymous' });
    } catch (routerErr) {
      const userMessage = routerErr?.userMessage || 'AI service is currently unavailable. Please try again later.';
      const status = routerErr?.status || 503;
      logger.error('AI router error', { error: routerErr?.message, status });
      logResponse('POST /api/generate', status, Date.now() - start);
      return NextResponse.json({ error: userMessage }, { status });
    }

    if (!replyText) {
      logResponse('POST /api/generate', 502, Date.now() - start);
      return NextResponse.json({ error: 'AI returned an empty response. Please try again.' }, { status: 502 });
    }

    // ── Process output ────────────────────────────────────────────────────────
    if (isImprove) {
      try {
        let cleanJsonText = replyText;
        if (cleanJsonText.startsWith('```json')) cleanJsonText = cleanJsonText.replace(/^```json\n?/, '');
        if (cleanJsonText.startsWith('```')) cleanJsonText = cleanJsonText.replace(/^```\n?/, '');
        if (cleanJsonText.endsWith('```')) cleanJsonText = cleanJsonText.replace(/\n?```$/, '');

        const improvedData = JSON.parse(cleanJsonText);

        if (userId) {
          try {
            await connectDB();
            await EmailHistory.create({
              userId,
              original_email: draftReply.trim(),
              generated_reply: improvedData.improvedReply,
              tone: 'Improved',
              created_at: new Date(),
            });
          } catch (dbErr) {
            logger.error('MongoDB save error (improve)', { error: dbErr?.message });
          }
        }

        logResponse('POST /api/generate', 200, Date.now() - start);
        return NextResponse.json({ improveResult: improvedData }, { headers: rateLimitHeaders(rl) });

      } catch (parseErr) {
        logger.error('JSON parse error for improve result', { error: parseErr.message });
        logResponse('POST /api/generate', 500, Date.now() - start);
        return NextResponse.json({ error: 'Failed to parse AI response. Please try again.' }, { status: 500 });
      }
    } else {
      let repliesArray = [replyText];
      if (numVariations > 1) {
        repliesArray = replyText.split('|||VARIATION|||').map(r => r.trim()).filter(r => r);
      }

      if (userId) {
        try {
          await connectDB();
          await EmailHistory.create({
            userId,
            original_email: originalEmail.trim(),
            generated_reply: repliesArray[0],
            tone,
            created_at: new Date(),
          });
        } catch (dbErr) {
          logger.error('MongoDB save error (generate)', { error: dbErr?.message });
        }
      }

      logResponse('POST /api/generate', 200, Date.now() - start);
      return NextResponse.json({ reply: repliesArray }, { headers: rateLimitHeaders(rl) });
    }

  } catch (error) {
    logger.error('Unhandled error in /api/generate', { error: error?.message, stack: error?.stack });
    logResponse('POST /api/generate', 500, Date.now() - start);
    return NextResponse.json({ error: `Server error: ${error?.message || 'Unknown error'}` }, { status: 500 });
  }
}
