-- Migration: Add marketing and email status columns to leads table
-- Version: 02
-- Description: Adds fields for tracking marketing consent and email deliverability status

-- Add marketing opt-in column
ALTER TABLE leads ADD COLUMN IF NOT EXISTS marketing_opt_in BOOLEAN DEFAULT NULL;

-- Add email status column with check constraint
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email_status TEXT DEFAULT NULL 
  CHECK (email_status IN ('valid', 'unsubscribed', 'bounced', 'complained', 'invalid'));

-- Add timestamp for email status updates
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email_status_updated_at TIMESTAMPTZ DEFAULT NULL;

-- Add index for case-insensitive email lookups
-- This index supports webhook lookups by email
CREATE INDEX IF NOT EXISTS idx_leads_email_lower ON leads (LOWER(email));

-- Add comment explaining the email_status field
COMMENT ON COLUMN leads.email_status IS 'Email deliverability status: valid (default), unsubscribed (user opted out), bounced (hard bounce), complained (spam complaint), invalid (validation failed)';

-- Add comment explaining the marketing_opt_in field
COMMENT ON COLUMN leads.marketing_opt_in IS 'Explicit marketing consent from user. NULL means not asked, TRUE means opted in, FALSE means opted out.';

-- Migration complete
-- Next steps:
-- 1. Update application code to set marketing_opt_in during lead capture
-- 2. Configure Mautic webhook to update email_status on bounces/unsubscribes
-- 3. Update email sending logic to check email_status before sending
