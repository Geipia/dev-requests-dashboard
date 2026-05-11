-- ============================================================
-- DevRequests Dashboard — Supabase Schema
-- Copie-colle ce SQL dans Supabase > SQL Editor > New Query
-- ============================================================

-- Table principale des demandes
CREATE TABLE IF NOT EXISTS requests (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT,
  type          TEXT NOT NULL DEFAULT 'website'
                CHECK (type IN ('website','webapp','mobile','api','design','other')),
  status        TEXT NOT NULL DEFAULT 'new'
                CHECK (status IN ('new','in_progress','review','completed','cancelled')),
  priority      TEXT NOT NULL DEFAULT 'medium'
                CHECK (priority IN ('low','medium','high','urgent')),
  client_name   TEXT,
  client_email  TEXT,
  budget        NUMERIC(12,2),
  actual_cost   NUMERIC(12,2),
  start_date    DATE,
  deadline      DATE,
  completed_at  TIMESTAMPTZ,
  technologies  TEXT[] DEFAULT '{}',
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Notes / commentaires par demande
CREATE TABLE IF NOT EXISTS request_comments (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id  UUID REFERENCES requests(id) ON DELETE CASCADE NOT NULL,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_requests_user_id   ON requests(user_id);
CREATE INDEX IF NOT EXISTS idx_requests_status    ON requests(status);
CREATE INDEX IF NOT EXISTS idx_comments_request   ON request_comments(request_id);

-- Mise à jour automatique de updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER requests_updated_at
  BEFORE UPDATE ON requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Row Level Security (RLS) — chaque utilisateur voit ses données
-- ============================================================
ALTER TABLE requests         ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_comments ENABLE ROW LEVEL SECURITY;

-- Policies requests
CREATE POLICY "Users see own requests"
  ON requests FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own requests"
  ON requests FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own requests"
  ON requests FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users delete own requests"
  ON requests FOR DELETE USING (auth.uid() = user_id);

-- Policies comments
CREATE POLICY "Users see comments on own requests"
  ON request_comments FOR SELECT
  USING (request_id IN (SELECT id FROM requests WHERE user_id = auth.uid()));

CREATE POLICY "Users insert comments on own requests"
  ON request_comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    request_id IN (SELECT id FROM requests WHERE user_id = auth.uid())
  );
