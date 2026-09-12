-- JANSETU HIGH-TRAFFIC PRODUCTION PERFORMANCE & SECURITY HARDENING MIGRATION
-- Date: 2026-09-12
-- Target: Supabase PostgreSQL

-- 1. INDEXES FOR HIGH-SPEED QUERYING (FREQUENTLY FILTERED COLUMNS)
CREATE INDEX IF NOT EXISTS idx_reported_data_status ON public.reported_data(status);
CREATE INDEX IF NOT EXISTS idx_reported_data_district ON public.reported_data(district);
CREATE INDEX IF NOT EXISTS idx_reported_data_block ON public.reported_data(block_ward);
CREATE INDEX IF NOT EXISTS idx_reported_data_panchayat ON public.reported_data(panchayat);
CREATE INDEX IF NOT EXISTS idx_reported_data_category ON public.reported_data(category);
CREATE INDEX IF NOT EXISTS idx_reported_data_created_at ON public.reported_data(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reported_data_user_id ON public.reported_data(user_id);
CREATE INDEX IF NOT EXISTS idx_reported_data_master_issue_id ON public.reported_data(master_issue_id);

CREATE INDEX IF NOT EXISTS idx_master_issues_district_status ON public.master_issues(district, current_status);
CREATE INDEX IF NOT EXISTS idx_master_issues_priority_sla ON public.master_issues(priority_level, sla_status);

-- 2. MATERIALIZED SUMMARY VIEWS FOR HIGH-TRAFFIC DASHBOARDS (AVOIDS N+1 HEAVY COUNTS)
CREATE OR REPLACE VIEW public.vw_district_civic_stats AS
SELECT 
    district,
    COUNT(id) AS total_complaints,
    COUNT(CASE WHEN status = 'resolved' OR status = 'Closed' THEN 1 END) AS total_resolved,
    COUNT(CASE WHEN status = 'open' OR status = 'Submitted' THEN 1 END) AS total_open,
    COUNT(CASE WHEN is_flagged = TRUE THEN 1 END) AS total_flagged,
    MAX(created_at) AS last_report_at
FROM public.reported_data
GROUP BY district;

CREATE OR REPLACE VIEW public.vw_master_issue_summaries AS
SELECT 
    m.id,
    m.master_issue_id,
    m.title,
    m.category,
    m.district,
    m.block_ward,
    m.current_status,
    m.priority_level,
    m.sla_status,
    m.total_linked_reports,
    m.total_affected_users,
    m.assigned_department,
    m.created_at
FROM public.master_issues m;

-- 3. AUDIT & REFORCE ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.reported_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Public reports read access" ON public.reported_data;
    DROP POLICY IF EXISTS "User complaint insert access" ON public.reported_data;
    DROP POLICY IF EXISTS "User profile access" ON public.profiles;
END $$;

-- Citizen can read public complaints or own private complaints
CREATE POLICY "Public reports read access"
ON public.reported_data FOR SELECT
USING (privacy_level = 'public' OR auth.uid() = user_id OR auth.uid() = reporter_id);

-- Authenticated or anonymous users can insert complaints with non-null required fields
CREATE POLICY "User complaint insert access"
ON public.reported_data FOR INSERT
WITH CHECK (
    (auth.uid() IS NOT NULL OR user_id IS NULL)
    AND title IS NOT NULL 
    AND description IS NOT NULL
);

-- Users can manage their own profile safely
CREATE POLICY "User profile access"
ON public.profiles FOR ALL
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 4. GRANT READ ACCESS ON VIEWS TO ANON AND AUTHENTICATED
GRANT SELECT ON public.vw_district_civic_stats TO anon, authenticated;
GRANT SELECT ON public.vw_master_issue_summaries TO anon, authenticated;
