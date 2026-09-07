/**
 * Groq AI Provider
 * Uses Groq's OpenAI-compatible REST API via native fetch (no extra dependencies).
 * Free-tier model: llama-3.3-70b-versatile (Groq free tier as of 2025).
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODELS = [
  'openai/gpt-oss-120b',
  'qwen/qwen3.8-27b',
  'openai/gpt-oss-20b',
];
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

  let lastError = null;

  for (const model of GROQ_MODELS) {
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
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });

      clearTimeout(timer);

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        const msg = errBody?.error?.message || `HTTP ${response.status}`;

        if (response.status === 429) {
          throw Object.assign(new Error(`Groq rate limit on ${model}: ${msg}`), { code: 'RATE_LIMIT', status: 429 });
        }
        if (response.status >= 500) {
          throw Object.assign(new Error(`Groq server error on ${model}: ${msg}`), { code: 'SERVER_ERROR', status: response.status });
        }

        throw Object.assign(new Error(`Groq error on ${model}: ${msg}`), { status: response.status });
      }

      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content?.trim();
      if (!text) throw new Error(`Groq returned empty response for ${model}`);

      return text;

    } catch (err) {
      clearTimeout(timer);
      lastError = err;

      if (err.name === 'AbortError') {
        console.warn(`[Groq] Request timed out on ${model}, trying next model…`);
        continue;
      }

      console.warn(`[Groq] Model ${model} failed: ${err.message}, trying next model…`);
      continue;
    }
  }

  throw lastError || new Error('All Groq models exhausted.');
}
