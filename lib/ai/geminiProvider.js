/**
 * Gemini AI Provider
 * Uses @google/generative-ai (already installed).
 * Tries each model in order and falls back to the next on 404/not-found.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

/** Models tried in order – mirrors the original route.js list */
const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
  'gemini-1.5-pro',
  'gemini-pro',
];

/** Milliseconds before we give up on a single model call */
const GEMINI_TIMEOUT_MS = 20_000;

/**
 * @param {string} prompt
 * @returns {Promise<string>} raw text from the model
 * @throws if all models fail or quota/safety errors occur
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
          setTimeout(() => reject(Object.assign(new Error('Gemini timeout'), { code: 'TIMEOUT' })), GEMINI_TIMEOUT_MS)
        ),
      ]);

      const text = result.response.text()?.trim();
      if (text) return text;

    } catch (err) {
      lastError = err;
      const msg = (err?.message || '').toLowerCase();
      const status = err?.status;

      // Timeout or quota/rate-limit → bubble up so router can try next provider
      if (err?.code === 'TIMEOUT') throw err;
      if (status === 429 || msg.includes('quota') || msg.includes('resource_exhausted')) throw err;
      if (status >= 500 && status < 600) throw err;

      // Safety block → not retriable via other providers
      if (msg.includes('safety') || msg.includes('blocked')) {
        throw Object.assign(new Error('Content blocked by safety filters.'), { code: 'SAFETY' });
      }

      // 404 / model not found → try next Gemini model
      if (status === 404 || msg.includes('not found') || msg.includes('404')) {
        console.warn(`[Gemini] Model ${modelName} unavailable, trying next model…`);
        continue;
      }

      // Any other error → break and let router try next provider
      throw err;
    }
  }

  throw lastError || new Error('All Gemini models exhausted.');
}
