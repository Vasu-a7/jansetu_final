-- ============================================================================
-- JANSETU: PHASE 1 ANTI-FAKE & DISINFORMATION DEFENSE SCHEMA
-- Protects civic reporting from fraudulent, duplicate, and spam claims.
-- ============================================================================

-- 1. Enhance reported_data table with anti-fake columns
ALTER TABLE IF EXISTS public.reported_data
  ADD COLUMN IF NOT EXISTS tracking_id VARCHAR(64) UNIQUE,
  ADD COLUMN IF NOT EXISTS evidence_timestamp TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS is_duplicate_linked BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS master_issue_id TEXT,
  ADD COLUMN IF NOT EXISTS reporter_reputation_score INT DEFAULT 60,
  ADD COLUMN IF NOT EXISTS moderation_status VARCHAR(32) DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS is_student_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS volunteer_rating INT,
  ADD COLUMN IF NOT EXISTS volunteer_name TEXT,
  ADD COLUMN IF NOT EXISTS volunteer_college TEXT;

-- Create index on tracking_id for instant collision-free lookups
CREATE INDEX IF NOT EXISTS idx_reported_data_tracking_id ON public.reported_data(tracking_id);
CREATE INDEX IF NOT EXISTS idx_reported_data_moderation_status ON public.reported_data(moderation_status);

-- 2. Reporter Reputation & Trust Score Table
CREATE TABLE IF NOT EXISTS public.user_reputations (
  user_id TEXT PRIMARY KEY,
  score INT NOT NULL DEFAULT 60 CHECK (score >= 0 AND score <= 100),
  tier VARCHAR(32) NOT NULL DEFAULT 'new' CHECK (tier IN ('new', 'trusted', 'civic_leader', 'probation')),
  verified_reports_count INT NOT NULL DEFAULT 0,
  rejected_reports_count INT NOT NULL DEFAULT 0,
  helpful_audits_count INT NOT NULL DEFAULT 0,
  last_activity TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Moderation Review Queue Table
CREATE TABLE IF NOT EXISTS public.moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id TEXT NOT NULL,
  tracking_id VARCHAR(64) NOT NULL,
  report_title TEXT NOT NULL,
  category VARCHAR(64) NOT NULL,
  district VARCHAR(64),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  media_url TEXT,
  reporter_id TEXT NOT NULL,
  flag_reason VARCHAR(64) NOT NULL CHECK (flag_reason IN ('fake_non_existent', 'wrong_location', 'abusive_language', 'duplicate_spam', 'already_resolved')),
  flag_details TEXT,
  flagged_by TEXT DEFAULT 'community',
  moderation_status VARCHAR(32) NOT NULL DEFAULT 'pending_review' CHECK (moderation_status IN ('pending_review', 'approved', 'rejected', 'evidence_requested')),
  moderator_notes TEXT,
  rejection_reason TEXT,
  moderated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mod_queue_status ON public.moderation_queue(moderation_status);

-- 4. Citizen Appeal Table
CREATE TABLE IF NOT EXISTS public.report_appeals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id TEXT NOT NULL,
  tracking_id VARCHAR(64) NOT NULL,
  reporter_id TEXT NOT NULL,
  appeal_reason TEXT NOT NULL,
  additional_evidence_url TEXT,
  status VARCHAR(32) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'upheld', 'denied')),
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appeals_status ON public.report_appeals(status);

-- 5. Row-Level Security (RLS) Policies
ALTER TABLE public.user_reputations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_appeals ENABLE ROW LEVEL SECURITY;

-- Allow read access for authenticated users, full access for service_role
CREATE POLICY "Public read user_reputations" ON public.user_reputations FOR SELECT USING (true);
CREATE POLICY "Public insert/update user_reputations" ON public.user_reputations FOR ALL USING (true);

CREATE POLICY "Public read moderation_queue" ON public.moderation_queue FOR SELECT USING (true);
CREATE POLICY "Public insert/update moderation_queue" ON public.moderation_queue FOR ALL USING (true);

CREATE POLICY "Public read report_appeals" ON public.report_appeals FOR SELECT USING (true);
CREATE POLICY "Public insert report_appeals" ON public.report_appeals FOR INSERT WITH CHECK (true);

