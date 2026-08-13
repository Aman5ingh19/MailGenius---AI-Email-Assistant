/**
 * Groq AI Provider
 * Uses Groq's OpenAI-compatible REST API via native fetch (no extra dependencies).
 * Free-tier model: llama-3.3-70b-versatile (Groq free tier as of 2025).
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const GROQ_TIMEOUT_MS = 25_000;

/**
 * @param {string} prompt
 * @returns {Promise<string>} raw text from the model
 * @throws if the request fails or quota is exceeded
 */
export async function callGroq(prompt) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    throw Object.assign(new Error('Groq API key is not configured.'), { code: 'CONFIG_ERROR' });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GROQ_TIMEOUT_MS);

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
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
        throw Object.assign(new Error(`Groq rate limit: ${msg}`), { code: 'RATE_LIMIT', status: 429 });
      }
      // Server errors
      if (response.status >= 500) {
        throw Object.assign(new Error(`Groq server error: ${msg}`), { code: 'SERVER_ERROR', status: response.status });
      }

      throw Object.assign(new Error(`Groq error: ${msg}`), { status: response.status });
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error('Groq returned an empty response.');

    return text;

  } catch (err) {
    clearTimeout(timer);

    // AbortController fires as DOMException with name 'AbortError'
    if (err.name === 'AbortError') {
      throw Object.assign(new Error('Groq request timed out.'), { code: 'TIMEOUT' });
    }
    throw err;
  }
}
