/**
 * Gemini AI Provider
 * Uses @google/generative-ai (already installed).
 * Tries each model in order and falls back to the next on 404/not-found.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

/** Models tried in order – mirrors the original route.js list */
const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.6-flash',
];

/** Milliseconds before we give up on a single model call */
const GEMINI_TIMEOUT_MS = 8_000;

/**
 * @param {string} prompt
 * @returns {Promise<string>} raw text from the model
 * @throws if all models fail or safety errors occur
 */
export async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw Object.assign(new Error('Gemini API key is not configured.'), { code: 'CONFIG_ERROR' });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  let lastError = null;

  for (const modelName of GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });

      // Wrap in a timeout race
      const result = await Promise.race([
        model.generateContent(prompt),
        new Promise((_, reject) =>
          setTimeout(() => reject(Object.assign(new Error(`Gemini timeout on ${modelName}`), { code: 'TIMEOUT' })), GEMINI_TIMEOUT_MS)
        ),
      ]);

      const text = result.response.text()?.trim();
      if (text) return text;

    } catch (err) {
      lastError = err;
      const msg = (err?.message || '').toLowerCase();
      const status = err?.status;

      // Safety block → not retriable via other providers or models
      if (msg.includes('safety') || msg.includes('blocked')) {
        throw Object.assign(new Error('Content blocked by safety filters.'), { code: 'SAFETY' });
      }

      console.warn(`[Gemini] Model ${modelName} failed (${status || err?.code || msg}), trying next model…`);
      // Continue to next Gemini model on 503, 404, 429, timeout, or other model-specific errors
      continue;
    }
  }

  throw lastError || new Error('All Gemini models exhausted.');
}
