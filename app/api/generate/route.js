import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import EmailHistory from '@/lib/models/EmailHistory';

export async function POST(request) {
  try {
    const body = await request.json();
    const { originalEmail, tone, length, variations, useEmojis, action, draftReply, inputLanguage } = body;

    const isImprove = action === 'improve';

    // ── Input validation ───────────────────────────────────────────
    if (isImprove) {
      if (!draftReply || typeof draftReply !== 'string' || !draftReply.trim()) {
        return NextResponse.json({ error: 'Please provide a draft reply to improve.' }, { status: 400 });
      }
    } else {
      if (!originalEmail || typeof originalEmail !== 'string' || !originalEmail.trim()) {
        return NextResponse.json({ error: 'Please provide an original email.' }, { status: 400 });
      }
    }

    const validTones = ['formal', 'friendly', 'concise', 'persuasive'];
    const normalizedTone = (tone || 'formal').toLowerCase();
    if (!isImprove && !validTones.includes(normalizedTone)) {
      return NextResponse.json({ error: 'Invalid tone selected.' }, { status: 400 });
    }

    // ── API key check ──────────────────────────────────────────────
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return NextResponse.json(
        { error: 'Gemini API key is not configured. Please add GEMINI_API_KEY to .env.local.' },
        { status: 500 }
      );
    }

    // ── Build prompt ───────────────────────────────────────────────
    let prompt = '';
    const numVariations = parseInt(variations, 10) || 1;

    if (isImprove) {
      prompt = `You are an expert email editor. Your task is to improve the provided drafted reply.
Check for grammar, spelling, clarity, tone, and professionalism.
If an original email is provided, check if the reply makes sense in context.
Preserve the user's original meaning and DO NOT invent any new information.
The input language is: ${inputLanguage || 'Auto Detect'}.
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
      prompt = `You are a professional email assistant. Rewrite the following email as a reply in a ${normalizedTone} tone. `;
      
      // Length constraints
      if (length === 'shorter') prompt += 'Be highly concise and brief (1-3 sentences maximum). ';
      if (length === 'longer') prompt += 'Be detailed and thorough, expanding on points thoughtfully (multiple paragraphs). ';
      
      // Emoji constraint
      if (useEmojis) prompt += 'Naturally include relevant emojis throughout the text. ';
      else prompt += 'Do NOT use any emojis. ';

      // Variations
      if (numVariations > 1) {
        prompt += `\n\nCRITICAL INSTRUCTION: You must provide EXACTLY ${numVariations} completely distinct variations of the reply. Separate each variation strictly with this exact delimiter on a new line: |||VARIATION|||\nDo not include numbering like "Variation 1:" or markdown, just the raw text of each reply separated by the delimiter.`;
      } else {
        prompt += '\n\nReturn ONLY the reply text, no explanations, no markdown, no quotes around it.';
      }

      prompt += `\n\nOriginal email:\n${originalEmail.trim()}`;
    }

    // ── Call Gemini (with automatic model fallback) ────────────────
    let replyText = '';
    let lastError = null;

    const modelsToTry = [
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-1.5-flash-8b',
      'gemini-1.5-pro',
      'gemini-pro'
    ];

    const genAI = new GoogleGenerativeAI(apiKey);

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        replyText = result.response.text()?.trim();
        
        if (replyText) {
          lastError = null;
          break; // Success! Break out of the loop
        }
      } catch (err) {
        lastError = err;
        const msg = err?.message || '';
        const status = err?.status;

        if (status === 404 || msg.includes('not found') || msg.includes('404')) {
          console.warn(`[Gemini Fallback] Model ${modelName} not available, trying next...`);
          continue; 
        }
        break;
      }
    }

    if (lastError) {
      const msg = lastError?.message || '';
      console.error('[Gemini Fatal Error]', msg);

      if (lastError?.status === 429 || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
        return NextResponse.json(
          { error: 'API quota exceeded. Please check your Gemini API billing/limits.' },
          { status: 429 }
        );
      }
      if (msg.includes('SAFETY') || msg.includes('blocked')) {
        return NextResponse.json(
          { error: 'Content blocked by Gemini safety filters. Please revise your email.' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: `Gemini API error: ${msg || 'Unknown error. Check server logs.'}` },
        { status: 502 }
      );
    }

    if (!replyText) {
      return NextResponse.json(
        { error: 'Gemini returned an empty response. Please try again.' },
        { status: 502 }
      );
    }

    // Process output based on action
    if (isImprove) {
      try {
        // Clean markdown syntax if model added it despite instructions
        let cleanJsonText = replyText;
        if (cleanJsonText.startsWith('```json')) cleanJsonText = cleanJsonText.replace(/^```json\n?/, '');
        if (cleanJsonText.startsWith('```')) cleanJsonText = cleanJsonText.replace(/^```\n?/, '');
        if (cleanJsonText.endsWith('```')) cleanJsonText = cleanJsonText.replace(/\n?```$/, '');
        
        const improvedData = JSON.parse(cleanJsonText);
        
        // Save to MongoDB
        try {
          await connectDB();
          await EmailHistory.create({
            original_email: draftReply.trim(), // Storing the drafted reply as original
            generated_reply: improvedData.improvedReply,
            tone: 'Improved',
            created_at: new Date(),
          });
        } catch (dbErr) {
          console.error('[MongoDB Save Error]', dbErr?.message);
        }

        return NextResponse.json({ improveResult: improvedData });

      } catch (parseErr) {
        console.error('[JSON Parse Error]', parseErr, replyText);
        return NextResponse.json(
          { error: 'Failed to parse AI response. Please try again.' },
          { status: 500 }
        );
      }
    } else {
      // Split variations if requested
      let repliesArray = [replyText];
      if (numVariations > 1) {
        repliesArray = replyText.split('|||VARIATION|||').map(r => r.trim()).filter(r => r);
      }

      // Save to MongoDB
      try {
        await connectDB();
        await EmailHistory.create({
          original_email: originalEmail.trim(),
          generated_reply: repliesArray[0],
          tone: normalizedTone,
          created_at: new Date(),
        });
      } catch (dbErr) {
        console.error('[MongoDB Save Error]', dbErr?.message);
      }

      return NextResponse.json({ reply: repliesArray });
    }

  } catch (error) {
    console.error('[/api/generate] Unhandled error:', error);
    return NextResponse.json(
      { error: `Server error: ${error?.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
