-- JANSETU CIVIC PLATFORM DATABASE MIGRATION & RLS POLICIES
-- Date: 2025-09-12
-- Target Database: Supabase PostgreSQL

-- 1. ENUMS FOR USER ROLES AND COMPLAINT STATUSES
DO $$ BEGIN
    CREATE TYPE app_role AS ENUM ('citizen', 'volunteer', 'ngo', 'verified_official', 'dept_admin', 'moderator', 'super_admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE challenge_status AS ENUM ('open', 'acknowledged', 'assigned', 'under_review', 'active', 'action_taken', 'resolved', 'reopened', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. REPORTED DATA / CIVIC COMPLAINTS TABLE
CREATE TABLE IF NOT EXISTS public.reported_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_id TEXT UNIQUE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    urgency TEXT DEFAULT 'medium',
    privacy_level TEXT DEFAULT 'public',
    district TEXT DEFAULT 'Ranchi',
    block_ward TEXT,
    location_text TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    media_url TEXT,
    audio_url TEXT,
    preferred_language TEXT DEFAULT 'hi',
    verified_by_volunteer BOOLEAN DEFAULT FALSE,
    verification_count INT DEFAULT 0,
    is_flagged BOOLEAN DEFAULT FALSE,
    flag_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. COMPLAINT TIMELINE & AUDIT TRAIL TABLE
CREATE TABLE IF NOT EXISTS public.complaint_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID REFERENCES public.reported_data(id) ON DELETE CASCADE,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    changed_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    actor_role TEXT DEFAULT 'system',
    action_notes TEXT NOT NULL,
    evidence_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. EMERGENCY & HELPLINE DIRECTORY TABLE
CREATE TABLE IF NOT EXISTS public.emergency_directory (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    hindi_title TEXT NOT NULL,
    number TEXT NOT NULL,
    category TEXT NOT NULL,
    department TEXT NOT NULL,
    official_url TEXT,
    last_verified_date DATE DEFAULT CURRENT_DATE,
    description TEXT,
    available_hours TEXT DEFAULT '24/7',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MODERATION QUEUE TABLE
CREATE TABLE IF NOT EXISTS public.moderation_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id TEXT NOT NULL,
    content_type TEXT DEFAULT 'report',
    reported_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    resolution_notes TEXT,
    resolved_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
ALTER TABLE public.reported_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_directory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_queue ENABLE ROW LEVEL SECURITY;

-- 7. RLS POLICIES FOR PUBLIC & AUTHENTICATED ACCESS

-- Read Policy for Complaints: Public complaints accessible by all; confidential/anonymous restricted
CREATE POLICY "Public complaints are readable by everyone" 
ON public.reported_data FOR SELECT 
USING (privacy_level = 'public' OR auth.uid() = user_id OR auth.uid() = reporter_id);

-- Insert Policy for Complaints: Authenticated users & anonymous guest reporters
CREATE POLICY "Authenticated users can submit complaints" 
ON public.reported_data FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL OR user_id IS NULL);

-- Update Policy: Owner or official/admin can update complaint
CREATE POLICY "Users can update own complaints or officials update status" 
ON public.reported_data FOR UPDATE 
USING (auth.uid() = user_id OR auth.uid() = reporter_id OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role IN ('verified_official', 'dept_admin', 'moderator', 'super_admin')
));

-- Read Policy for Audits: Accessible for matching complaint
CREATE POLICY "Complaint audit history is readable by everyone" 
ON public.complaint_audits FOR SELECT 
USING (TRUE);

-- Read Policy for Emergency Directory: Fully public read access
CREATE POLICY "Emergency directory is readable by everyone" 
ON public.emergency_directory FOR SELECT 
USING (TRUE);

-- 8. INDEXES FOR FAST PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_reported_data_district ON public.reported_data(district);
CREATE INDEX IF NOT EXISTS idx_reported_data_status ON public.reported_data(status);
CREATE INDEX IF NOT EXISTS idx_reported_data_created ON public.reported_data(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_complaint_audits_complaint_id ON public.complaint_audits(complaint_id);

