/**
 * OpenRouter AI Provider
 * Uses OpenRouter's OpenAI-compatible REST API via native fetch (no extra dependencies).
 * Model: openrouter/free — OpenRouter's built-in free-tier router.
 * This always resolves to a currently available free model; it never uses paid models.
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODEL = 'openrouter/free';
const OPENROUTER_TIMEOUT_MS = 30_000;

/**
 * @param {string} prompt
 * @returns {Promise<string>} raw text from the model
 * @throws if the request fails or quota is exceeded
 */
export async function callOpenRouter(prompt) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
    throw Object.assign(new Error('OpenRouter API key is not configured.'), { code: 'CONFIG_ERROR' });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OPENROUTER_TIMEOUT_MS);

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        // OpenRouter recommended headers
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'MailGenius AI Email Assistant',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    clearTimeout(timer);

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      const msg = errBody?.error?.message || `HTTP ${response.status}`;

      // Rate limit / quota
      if (response.status === 429) {
        throw Object.assign(new Error(`OpenRouter rate limit: ${msg}`), { code: 'RATE_LIMIT', status: 429 });
      }
      // Server errors
      if (response.status >= 500) {
        throw Object.assign(new Error(`OpenRouter server error: ${msg}`), { code: 'SERVER_ERROR', status: response.status });
      }

      throw Object.assign(new Error(`OpenRouter error: ${msg}`), { status: response.status });
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error('OpenRouter returned an empty response.');

    return text;

  } catch (err) {
    clearTimeout(timer);

    if (err.name === 'AbortError') {
      throw Object.assign(new Error('OpenRouter request timed out.'), { code: 'TIMEOUT' });
    }
    throw err;
  }
}
