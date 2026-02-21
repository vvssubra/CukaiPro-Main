-- Add email_sent_at to invitations table for tracking invite emails
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ;
