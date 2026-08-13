/**
 * Central AI Router
 *
 * Priority: Gemini → Groq → OpenRouter
 *
 * A provider is retried on the NEXT provider when it throws any of:
 *   - code === 'TIMEOUT'
 *   - code === 'RATE_LIMIT'
 *   - code === 'SERVER_ERROR'
 *   - HTTP status 429 or 5xx
 *   - message contains 'quota' / 'resource_exhausted' / 'rate limit'
 *
 * Non-retriable errors (SAFETY, CONFIG_ERROR, 400 bad-request) stop
 * immediately and surface to the caller.
 *
 * Rate limiting: a simple in-process sliding-window counter prevents
 * more than MAX_REQUESTS_PER_WINDOW requests within WINDOW_MS milliseconds
 * per server process, protecting all providers' free-tier quotas.
 */

import { callGemini } from './geminiProvider.js';
import { callGroq } from './groqProvider.js';
import { callOpenRouter } from './openrouterProvider.js';

// ── In-process rate limiter ─────────────────────────────────────────────────
/** Maximum requests allowed inside the sliding window */
const MAX_REQUESTS_PER_WINDOW = 20;
/** Window length in milliseconds (60 seconds) */
const WINDOW_MS = 60_000;

/** @type {number[]} timestamps of recent requests */
const requestTimestamps = [];

/**
 * Returns true if the request should be allowed, false if rate-limited.
 * Side-effect: records the current timestamp when allowed.
 */
function checkRateLimit() {
  const now = Date.now();
  // Remove timestamps older than the window
  while (requestTimestamps.length > 0 && now - requestTimestamps[0] > WINDOW_MS) {
    requestTimestamps.shift();
  }
  if (requestTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  requestTimestamps.push(now);
  return true;
}

// ── Provider chain ──────────────────────────────────────────────────────────
/** Ordered list of providers. Add/remove/reorder here to change priority. */
const PROVIDERS = [
  { name: 'Gemini', call: callGemini },
  { name: 'Groq', call: callGroq },
  { name: 'OpenRouter', call: callOpenRouter },
];

/**
 * Determines whether an error from a provider should cause the router to
 * fall through to the next provider in the chain.
 * @param {Error} err
 * @returns {boolean}
 */
function isRetriableError(err) {
  if (!err) return false;

  // Explicit retriable codes set by our providers
  if (err.code === 'TIMEOUT' || err.code === 'RATE_LIMIT' || err.code === 'SERVER_ERROR') {
    return true;
  }

  const status = err.status ?? 0;
  if (status === 429 || (status >= 500 && status < 600)) return true;

  const msg = (err.message || '').toLowerCase();
  if (
    msg.includes('quota') ||
    msg.includes('resource_exhausted') ||
    msg.includes('rate limit') ||
    msg.includes('rate_limit') ||
    msg.includes('timeout') ||
    msg.includes('too many requests')
  ) {
    return true;
  }

  return false;
}

/**
 * Calls providers in priority order with automatic fallback.
 *
 * @param {string} prompt  - The prompt to send to the AI
 * @returns {Promise<{ text: string, provider: string }>}
 * @throws {{ userMessage: string, status: number }} on final failure
 */
export async function generateWithFallback(prompt) {
  // ── Rate limit gate ───────────────────────────────────────────────────────
  if (!checkRateLimit()) {
    throw {
      userMessage: 'Too many requests. Please wait a moment and try again.',
      status: 429,
    };
  }

  const providerErrors = [];

  for (const provider of PROVIDERS) {
    try {
      console.log(`[AI Router] Trying provider: ${provider.name}`);
      const text = await provider.call(prompt);
      console.log(`[AI Router] Success with provider: ${provider.name}`);
      return { text, provider: provider.name };

    } catch (err) {
      const msg = err?.message || String(err);
      console.warn(`[AI Router] Provider ${provider.name} failed: ${msg}`);
      providerErrors.push({ provider: provider.name, error: msg });

      // Non-retriable errors (safety, bad config, bad input) stop immediately
      if (err?.code === 'SAFETY') {
        throw {
          userMessage: 'Content blocked by AI safety filters. Please revise your email.',
          status: 400,
        };
      }
      if (err?.code === 'CONFIG_ERROR') {
        // Provider not configured — silently skip to next
        continue;
      }

      // Retriable → try next provider
      if (isRetriableError(err)) {
        continue;
      }

      // Unknown error — log and try next provider defensively
      console.error(`[AI Router] Unknown error from ${provider.name}:`, err);
      continue;
    }
  }

  // All providers failed
  console.error('[AI Router] All providers exhausted:', providerErrors);
  throw {
    userMessage:
      'All AI providers are currently unavailable (quota or connectivity issues). Please try again in a few minutes.',
    status: 503,
  };
}
