-- ============================================================
-- TALONS NEWS - PostgreSQL Schema
-- Compatible with Neon, Supabase, and standard PostgreSQL
-- ============================================================

CREATE TYPE volatility AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- News articles table
CREATE TABLE IF NOT EXISTS news (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title           TEXT NOT NULL,
  content         TEXT,
  source          TEXT NOT NULL,
  url             TEXT NOT NULL UNIQUE,
  url_hash        TEXT NOT NULL UNIQUE,
  published_at    TIMESTAMPTZ NOT NULL,
  sentiment_score DOUBLE PRECISION NOT NULL DEFAULT 0,
  impact_score    DOUBLE PRECISION NOT NULL DEFAULT 0,
  volatility      volatility NOT NULL DEFAULT 'LOW',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_news_published_at ON news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_impact_score  ON news(impact_score DESC);
CREATE INDEX IF NOT EXISTS idx_news_volatility    ON news(volatility);

-- Tokens table (seeded with top 200 tokens)
CREATE TABLE IF NOT EXISTS tokens (
  id                 TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name               TEXT NOT NULL,
  symbol             TEXT NOT NULL UNIQUE,
  keywords           TEXT[] NOT NULL DEFAULT '{}',
  market_cap         DOUBLE PRECISION,
  liquidity_estimate DOUBLE PRECISION,
  rank               INTEGER,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tokens_symbol ON tokens(symbol);

-- News → Token impact join table
CREATE TABLE IF NOT EXISTS news_token_impacts (
  id                  TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  news_id             TEXT NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  token_id            TEXT NOT NULL REFERENCES tokens(id) ON DELETE CASCADE,
  confidence_score    DOUBLE PRECISION NOT NULL DEFAULT 0,
  expected_volatility volatility NOT NULL DEFAULT 'LOW',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(news_id, token_id)
);

CREATE INDEX IF NOT EXISTS idx_nti_news_id  ON news_token_impacts(news_id);
CREATE INDEX IF NOT EXISTS idx_nti_token_id ON news_token_impacts(token_id);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_news_updated_at
  BEFORE UPDATE ON news
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tokens_updated_at
  BEFORE UPDATE ON tokens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
