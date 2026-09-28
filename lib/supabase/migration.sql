-- ============================================================
-- MailGenius — 100% Supabase PostgreSQL & RAG Migration
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Enable pgvector extension for AI RAG embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT, -- null for OAuth users
  image TEXT,
  cloudinary_public_id TEXT,
  provider TEXT DEFAULT 'credentials',
  fcm_tokens TEXT[] DEFAULT '{}'::text[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Email History Table
CREATE TABLE IF NOT EXISTS public.email_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  original_email TEXT NOT NULL,
  generated_reply TEXT NOT NULL,
  tone TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Templates Table
CREATE TABLE IF NOT EXISTS public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  label TEXT NOT NULL,
  reply_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Password Reset Tokens Table
CREATE TABLE IF NOT EXISTS public.reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  token TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Email Embeddings Table (Vector store for RAG)
CREATE TABLE IF NOT EXISTS public.email_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  original_email TEXT NOT NULL,
  generated_reply TEXT NOT NULL,
  tone TEXT NOT NULL,
  embedding vector(768), -- Gemini text-embedding-004 produces 768 dimensions
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── INDEXES FOR HIGH PERFORMANCE ─────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_email_history_user_id ON public.email_history(user_id);
CREATE INDEX IF NOT EXISTS idx_email_history_created_at ON public.email_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_templates_user_id ON public.templates(user_id);
CREATE INDEX IF NOT EXISTS idx_reset_tokens_token ON public.reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_email_embeddings_user_id ON public.email_embeddings(user_id);

-- HNSW Vector index for super-fast cosine similarity search
CREATE INDEX IF NOT EXISTS idx_email_embeddings_hnsw
  ON public.email_embeddings
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- ── RAG VECTOR SEARCH RPC FUNCTION ────────────────────────────
CREATE OR REPLACE FUNCTION match_email_embeddings(
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  p_user_id text
)
RETURNS TABLE (
  id UUID,
  original_email TEXT,
  generated_reply TEXT,
  tone TEXT,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ee.id,
    ee.original_email,
    ee.generated_reply,
    ee.tone,
    (1 - (ee.embedding <=> query_embedding))::float AS similarity
  FROM public.email_embeddings ee
  WHERE ee.user_id = p_user_id
    AND (1 - (ee.embedding <=> query_embedding)) > match_threshold
  ORDER BY ee.embedding <=> query_embedding ASC
  LIMIT match_count;
END;
$$;

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_embeddings ENABLE ROW LEVEL SECURITY;

-- Allow Service Role key to bypass RLS for server-side operations
DROP POLICY IF EXISTS "Service role full access users" ON public.users;
CREATE POLICY "Service role full access users" ON public.users FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access history" ON public.email_history;
CREATE POLICY "Service role full access history" ON public.email_history FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access templates" ON public.templates;
CREATE POLICY "Service role full access templates" ON public.templates FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access tokens" ON public.reset_tokens;
CREATE POLICY "Service role full access tokens" ON public.reset_tokens FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access embeddings" ON public.email_embeddings;
CREATE POLICY "Service role full access embeddings" ON public.email_embeddings FOR ALL TO service_role USING (true) WITH CHECK (true);
