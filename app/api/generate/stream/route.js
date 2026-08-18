import { auth } from '@/auth';
import { GenerateSchema, parseBody } from '@/lib/validation/schemas';
import { rateLimit } from '@/lib/rateLimit';
import logger from '@/lib/logger';

// ─── Gemini streaming via Google AI SDK ──────────────────────────────────────
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request) {
  try {
    const session = await auth();
    const userId = session?.user?.id || null;

    // Rate limit check
    const rateLimitKey = userId || request.headers.get('x-forwarded-for') || 'anonymous';
    const rl = await rateLimit(rateLimitKey, { limit: 20, windowSecs: 60 });
    if (!rl.allowed) {
      return new Response(JSON.stringify({ error: 'Too many requests. Please wait.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Zod validation
    const raw = await request.json();
    const { success, error: validationError, data } = parseBody(GenerateSchema, raw);
    if (!success) {
      return new Response(JSON.stringify({ error: validationError }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { originalEmail, tone, length, useEmojis } = data;

    if (!originalEmail.trim()) {
      return new Response(JSON.stringify({ error: 'Please provide an email to reply to.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Build prompt
    let prompt = `You are a professional email assistant. Rewrite the following email as a reply in a ${tone} tone. `;
    if (length === 'shorter') prompt += 'Be highly concise and brief (1-3 sentences maximum). ';
    if (length === 'longer') prompt += 'Be detailed and thorough (multiple paragraphs). ';
    if (useEmojis) prompt += 'Naturally include relevant emojis. ';
    else prompt += 'Do NOT use any emojis. ';
    prompt += '\n\nReturn ONLY the reply text, no explanations, no markdown.';
    prompt += `\n\nOriginal email:\n${originalEmail.trim()}`;

    // ── Server-Sent Events stream ─────────────────────────────────────────────
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
          const result = await model.generateContentStream(prompt);

          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              // SSE format: "data: <payload>\n\n"
              const sseMessage = `data: ${JSON.stringify({ token: text })}\n\n`;
              controller.enqueue(encoder.encode(sseMessage));
            }
          }

          // Signal stream completion
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
          controller.close();
          logger.info('AI stream completed', { userId: userId || 'anonymous' });
        } catch (err) {
          logger.error('AI stream error', { error: err.message });
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: 'Streaming failed. Please use the standard generator.' })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable Nginx buffering for SSE
      },
    });

  } catch (error) {
    logger.error('Unhandled error in /api/generate/stream', { error: error?.message });
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
