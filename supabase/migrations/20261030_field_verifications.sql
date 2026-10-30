-- Student field audits and evidence metadata
CREATE TABLE IF NOT EXISTS public.field_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID,
    challenge_title TEXT NOT NULL,
    volunteer_name TEXT NOT NULL,
    college_name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('verified_active', 'work_in_progress', 'verified_resolved')),
    quality_rating INTEGER NOT NULL CHECK (quality_rating BETWEEN 1 AND 5),
    audit_notes TEXT NOT NULL,
    evidence_name TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    credits_earned INTEGER NOT NULL DEFAULT 50,
    certificate_id TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.field_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Field verifications are readable by authenticated users"
ON public.field_verifications FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can submit field verifications"
ON public.field_verifications FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_field_verifications_challenge
ON public.field_verifications(challenge_id);

CREATE INDEX IF NOT EXISTS idx_field_verifications_created
ON public.field_verifications(created_at DESC);
