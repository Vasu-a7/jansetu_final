-- JANSETU CIVIC PLATFORM: COMPLAINT DEDUPLICATION, MASTER ISSUES & GOVERNANCE ACCOUNTABILITY MIGRATION
-- Date: 2026-09-12
-- Target: Supabase PostgreSQL

-- 1. MASTER ISSUES TABLE (Aggregated complaints linked to a single real-world problem)
CREATE TABLE IF NOT EXISTS public.master_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    master_issue_id TEXT UNIQUE NOT NULL, -- e.g. JST-RD-2026-00124
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    district TEXT NOT NULL DEFAULT 'Ranchi',
    block_ward TEXT,
    panchayat TEXT,
    village TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    affected_area TEXT,
    total_linked_reports INT DEFAULT 1,
    total_affected_users INT DEFAULT 1,
    affected_villages_count INT DEFAULT 1,
    first_reported_at TIMESTAMPTZ DEFAULT NOW(),
    latest_report_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_department TEXT NOT NULL DEFAULT 'Public Works Department (PWD)',
    assigned_officer_name TEXT,
    assigned_officer_contact TEXT,
    current_status TEXT NOT NULL DEFAULT 'Submitted',
    priority_level TEXT NOT NULL DEFAULT 'Medium', -- Low, Medium, High, Critical
    priority_score INT DEFAULT 45,
    sla_deadline TIMESTAMPTZ NOT NULL,
    sla_status TEXT DEFAULT 'on_time', -- on_time, warning, overdue
    escalation_level INT DEFAULT 1, -- 1: Ward, 2: BDO, 3: DC/DM, 4: State Nodal
    escalation_title TEXT DEFAULT 'Ward Engineer / Local Officer',
    next_escalation_at TIMESTAMPTZ,
    evidence_count INT DEFAULT 1,
    resolution_details JSONB, -- action_taken, completion_date, officer_info, before_after_urls
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. COMPLAINT LINKS TABLE (Maps individual reports to Master Issues)
CREATE TABLE IF NOT EXISTS public.complaint_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    master_issue_id UUID REFERENCES public.master_issues(id) ON DELETE CASCADE,
    complaint_id UUID REFERENCES public.reported_data(id) ON DELETE CASCADE,
    linked_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    link_status TEXT NOT NULL DEFAULT 'approved', -- suggested, approved, disputed, unlinked
    similarity_score INT DEFAULT 85,
    dispute_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. COMPLAINT STATUS LIFECYCLE HISTORY TABLE (12-Stage audit trail)
CREATE TABLE IF NOT EXISTS public.complaint_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID REFERENCES public.reported_data(id) ON DELETE CASCADE,
    master_issue_id UUID REFERENCES public.master_issues(id) ON DELETE CASCADE,
    from_status TEXT,
    to_status TEXT NOT NULL,
    changed_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    actor_role TEXT NOT NULL DEFAULT 'citizen', -- citizen, officer, bdo, dc, super_admin, system
    reason TEXT NOT NULL,
    supporting_evidence_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. COMPLAINT ESCALATION LOGS TABLE
CREATE TABLE IF NOT EXISTS public.complaint_escalations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    master_issue_id UUID REFERENCES public.master_issues(id) ON DELETE CASCADE,
    from_level INT NOT NULL,
    to_level INT NOT NULL,
    escalated_to_title TEXT NOT NULL,
    escalation_reason TEXT NOT NULL,
    overdue_days INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. COMPLAINT APPEALS TABLE
CREATE TABLE IF NOT EXISTS public.complaint_appeals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    master_issue_id UUID REFERENCES public.master_issues(id) ON DELETE CASCADE,
    complaint_id UUID REFERENCES public.reported_data(id) ON DELETE CASCADE,
    appellant_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    appeal_reason TEXT NOT NULL,
    additional_evidence_urls TEXT[],
    status TEXT DEFAULT 'under_appeal_review', -- under_appeal_review, appeal_accepted, appeal_rejected
    reviewer_remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.departments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    hindi_name TEXT NOT NULL,
    nodal_officer TEXT,
    email TEXT,
    helpline TEXT,
    acknowledgement_sla_hours INT DEFAULT 48,
    response_sla_days INT DEFAULT 7,
    resolution_sla_days INT DEFAULT 30
);

-- 7. AUDIT LOGS TABLE (Immutable audit log)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL, -- master_issue, report, link, priority, status
    entity_id TEXT NOT NULL,
    actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL, -- duplicate_suggestion, master_link, status_change, escalation, resolution_request
    link_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ADD DEDUPLICATION & MASTER ISSUE FIELDS TO `reported_data`
ALTER TABLE public.reported_data ADD COLUMN IF NOT EXISTS master_issue_id UUID REFERENCES public.master_issues(id) ON DELETE SET NULL;
ALTER TABLE public.reported_data ADD COLUMN IF NOT EXISTS master_tracking_id TEXT;
ALTER TABLE public.reported_data ADD COLUMN IF NOT EXISTS duplicate_status TEXT DEFAULT 'original'; -- original, suggested_duplicate, linked_duplicate, disputed
ALTER TABLE public.reported_data ADD COLUMN IF NOT EXISTS similarity_score INT DEFAULT 0;
ALTER TABLE public.reported_data ADD COLUMN IF NOT EXISTS panchayat TEXT;
ALTER TABLE public.reported_data ADD COLUMN IF NOT EXISTS village TEXT;
ALTER TABLE public.reported_data ADD COLUMN IF NOT EXISTS is_pii_redacted BOOLEAN DEFAULT FALSE;

-- 10. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.master_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_appeals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Master issues are readable by everyone" ON public.master_issues;
    DROP POLICY IF EXISTS "Complaint links are readable by everyone" ON public.complaint_links;
    DROP POLICY IF EXISTS "Status history readable by everyone" ON public.complaint_status_history;
    DROP POLICY IF EXISTS "Escalations readable by everyone" ON public.complaint_escalations;
    DROP POLICY IF EXISTS "Departments readable by everyone" ON public.departments;
    DROP POLICY IF EXISTS "Notifications readable by owner" ON public.notifications;
END $$;

CREATE POLICY "Master issues are readable by everyone" ON public.master_issues FOR SELECT USING (TRUE);
CREATE POLICY "Complaint links are readable by everyone" ON public.complaint_links FOR SELECT USING (TRUE);
CREATE POLICY "Status history readable by everyone" ON public.complaint_status_history FOR SELECT USING (TRUE);
CREATE POLICY "Escalations readable by everyone" ON public.complaint_escalations FOR SELECT USING (TRUE);
CREATE POLICY "Departments readable by everyone" ON public.departments FOR SELECT USING (TRUE);
CREATE POLICY "Notifications readable by owner" ON public.notifications FOR SELECT USING (auth.uid() = user_id);

-- 11. INDEXES FOR HIGH-SPEED QUERYING
CREATE INDEX IF NOT EXISTS idx_master_issues_district ON public.master_issues(district);
CREATE INDEX IF NOT EXISTS idx_master_issues_status ON public.master_issues(current_status);
CREATE INDEX IF NOT EXISTS idx_master_issues_priority ON public.master_issues(priority_level);
CREATE INDEX IF NOT EXISTS idx_master_issues_sla_status ON public.master_issues(sla_status);
CREATE INDEX IF NOT EXISTS idx_complaint_links_master ON public.complaint_links(master_issue_id);
CREATE INDEX IF NOT EXISTS idx_complaint_status_history_master ON public.complaint_status_history(master_issue_id);
