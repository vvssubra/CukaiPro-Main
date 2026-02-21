-- Add onboarding_completed_at to user_profiles for tracking onboarding completion.
-- When set, user has completed the guided onboarding wizard.

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz;

COMMENT ON COLUMN user_profiles.onboarding_completed_at IS 'When the user completed the guided onboarding wizard. Null means onboarding is incomplete.';
