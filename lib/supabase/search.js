/**
 * Supabase RAG Search — Retrieve similar past email replies via pgvector
 *
 * Flow:
 *   1. Convert the incoming email text → embedding (same Gemini model)
 *   2. Call Supabase RPC `match_email_embeddings` (PostgreSQL function)
 *   3. Function runs: cosine_similarity(query_vector, stored_vectors) ORDER BY similarity DESC
 *   4. Top-K results returned as context strings
 *   5. Context injected into Gemini prompt → personalized reply generation
 *
 * The PostgreSQL function uses pgvector's `<=>` (cosine distance) operator
 * with an HNSW index for approximate nearest neighbor search at scale.
 */

import { generateEmbedding } from './embeddings.js';
import { getSupabaseAdmin } from './client.js';

/** Number of similar past emails to retrieve as RAG context */
const TOP_K = 3;

/** Minimum cosine similarity score to include a result (0.0 – 1.0) */
const MIN_SIMILARITY = 0.65;

/**
 * Retrieves the top-K most semantically similar past email replies for a user.
 *
 * Uses pgvector HNSW cosine similarity search via a Supabase RPC call.
 *
 * @param {string} userId           - The authenticated user's ID
 * @param {string} incomingEmailText - The new incoming email (query text)
 * @param {number} [topK=TOP_K]     - Max results to return
 * @returns {Promise<Array<{original_email: string, generated_reply: string, tone: string, similarity: number}>>}
 */
export async function findSimilarEmails(userId, incomingEmailText, topK = TOP_K) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return []; // Supabase not configured

  try {
    // Step 1: Embed the incoming email (the query vector)
    const queryEmbedding = await generateEmbedding(incomingEmailText);
    if (!queryEmbedding) return [];

    // Step 2: Call the pgvector similarity search RPC function
    const { data, error } = await supabase.rpc('match_email_embeddings', {
      query_embedding: queryEmbedding,
      match_threshold: MIN_SIMILARITY,
      match_count: topK,
      p_user_id: userId,
    });

    if (error) {
      console.warn('[Supabase RAG] findSimilarEmails RPC error:', error.message);
      return [];
    }

    return data ?? [];
  } catch (err) {
    console.warn('[Supabase RAG] findSimilarEmails unexpected error:', err?.message);
    return [];
  }
}

/**
 * Formats RAG context results into a prompt-ready string.
 *
 * The returned string is injected into the Gemini prompt as "past context"
 * so the model can generate a more personalized and consistent reply.
 *
 * @param {Array} similarEmails - Results from findSimilarEmails()
 * @returns {string} Formatted context block, or empty string if no results
 */
export function buildRagContextBlock(similarEmails) {
  if (!similarEmails || similarEmails.length === 0) return '';

  const contextItems = similarEmails.map((item, index) => {
    const sim = Math.round((item.similarity ?? 0) * 100);
    return `[Past Email ${index + 1} — ${item.tone} tone, ${sim}% similar]
Original: ${item.original_email?.slice(0, 400)}
Your Reply: ${item.generated_reply?.slice(0, 400)}`;
  });

  return `
---PERSONALIZED CONTEXT FROM YOUR PAST EMAILS (use these to match the user's style)---
${contextItems.join('\n\n')}
---END OF CONTEXT---
`;
}

/**
 * Full RAG pipeline: find similar emails + build context string.
 * Used directly in /api/generate before building the main prompt.
 *
 * @param {string | null} userId
 * @param {string} originalEmail
 * @returns {Promise<string>} RAG context string (empty if no user or no results)
 */
export async function getRagContext(userId, originalEmail) {
  if (!userId || !originalEmail?.trim()) return '';

  const similarEmails = await findSimilarEmails(userId, originalEmail);
  return buildRagContextBlock(similarEmails);
}
