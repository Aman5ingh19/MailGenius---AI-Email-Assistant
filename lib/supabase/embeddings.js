/**
 * Supabase Embeddings — Store email reply vectors using Gemini embedding model
 *
 * Flow:
 *   1. Gemini text-embedding-004 model converts reply text → 768-dim float vector
 *   2. Vector stored in Supabase `email_embeddings` table (pgvector column)
 *   3. HNSW index on that column enables fast cosine similarity search later
 *
 * Graceful degradation: if Supabase is not configured, function returns null
 * and the rest of the generate flow is unaffected.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { getSupabaseAdmin } from './client.js';

/** Gemini embedding model — 768-dimensional output */
const EMBEDDING_MODEL = 'text-embedding-004';

/**
 * Generates a 768-dim text embedding using Gemini's embedding model.
 *
 * @param {string} text - The text to embed (email reply content)
 * @returns {Promise<number[] | null>} Float array of length 768, or null on error
 */
export async function generateEmbedding(text) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') return null;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });

    // Truncate to ~2000 chars — embedding models have token limits
    const truncatedText = text.slice(0, 2000);

    const result = await model.embedContent(truncatedText);
    return result.embedding.values; // float[]
  } catch (err) {
    console.warn('[Supabase Embeddings] generateEmbedding failed:', err?.message);
    return null;
  }
}

/**
 * Stores an email reply embedding in Supabase `email_embeddings` table.
 *
 * This is called AFTER a reply is successfully generated and saved to MongoDB.
 * The Supabase record is keyed by the same userId so we can do per-user search.
 *
 * @param {object} params
 * @param {string} params.userId       - The authenticated user's ID
 * @param {string} params.originalEmail - The incoming email text
 * @param {string} params.generatedReply - The AI-generated reply text
 * @param {string} params.tone          - Tone used (formal, friendly, etc.)
 * @param {number[]} params.embedding   - 768-dim float vector
 * @returns {Promise<string | null>} Inserted row ID, or null on failure
 */
export async function storeEmailEmbedding({ userId, originalEmail, generatedReply, tone, embedding }) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null; // Supabase not configured — silently skip

  try {
    const { data, error } = await supabase
      .from('email_embeddings')
      .insert({
        user_id: userId,
        original_email: originalEmail.slice(0, 3000), // Guard against huge payloads
        generated_reply: generatedReply.slice(0, 3000),
        tone,
        embedding, // pgvector column: vector(768)
      })
      .select('id')
      .single();

    if (error) {
      console.warn('[Supabase Embeddings] storeEmailEmbedding insert error:', error.message);
      return null;
    }

    return data?.id ?? null;
  } catch (err) {
    console.warn('[Supabase Embeddings] storeEmailEmbedding unexpected error:', err?.message);
    return null;
  }
}

/**
 * Main helper: generate embedding + store in Supabase (fire-and-forget style).
 *
 * Called from /api/generate after a successful reply is generated.
 * Does NOT throw — any failure is silently logged.
 *
 * @param {object} params
 * @param {string} params.userId
 * @param {string} params.originalEmail
 * @param {string} params.generatedReply
 * @param {string} params.tone
 */
export async function saveReplyEmbedding({ userId, originalEmail, generatedReply, tone }) {
  if (!userId) return; // Only store embeddings for authenticated users

  try {
    // Step 1: Generate vector embedding from the reply text
    const embedding = await generateEmbedding(generatedReply);
    if (!embedding) return;

    // Step 2: Store vector + metadata in Supabase
    const id = await storeEmailEmbedding({ userId, originalEmail, generatedReply, tone, embedding });

    if (id) {
      console.log(`[Supabase RAG] Embedding stored for userId: ${userId}, id: ${id}`);
    }
  } catch (err) {
    // Never crash the generate flow — RAG is additive, not critical
    console.warn('[Supabase RAG] saveReplyEmbedding failed silently:', err?.message);
  }
}
