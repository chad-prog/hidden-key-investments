-- ============================================================================
-- Marketing Columns Migration for Mautic Integration
-- ============================================================================
-- Adds marketing-related columns to the leads table:
-- - marketing_opt_in: Boolean flag for marketing consent
-- - email_status: Status tracking (subscribed/unsubscribed/bounced/complaint)
-- - email_status_updated_at: Timestamp for email status changes
-- - Index on email for efficient lookups
-- ============================================================================

-- Add marketing_opt_in column (defaults to true for new leads)
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS marketing_opt_in BOOLEAN DEFAULT true;

-- Add email_status column with constraint
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS email_status TEXT;

-- Add CHECK constraint for email_status
ALTER TABLE leads 
ADD CONSTRAINT IF NOT EXISTS email_status_check 
CHECK (email_status IS NULL OR email_status IN ('subscribed', 'unsubscribed', 'bounced', 'complaint'));

-- Add email_status_updated_at timestamp
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS email_status_updated_at TIMESTAMPTZ;

-- Create index on email for efficient webhook lookups
-- Using LOWER() for case-insensitive matching
CREATE INDEX IF NOT EXISTS idx_leads_email_lower 
ON leads (LOWER(email));

-- Add comment for documentation
COMMENT ON COLUMN leads.marketing_opt_in IS 'Marketing consent flag, updated by Mautic webhooks';
COMMENT ON COLUMN leads.email_status IS 'Email delivery status from Mautic (subscribed/unsubscribed/bounced/complaint)';
COMMENT ON COLUMN leads.email_status_updated_at IS 'Last update timestamp for email_status';

-- Set default email_status for existing leads without status
-- Only update leads with email and marketing_opt_in=true to minimize scope
UPDATE leads 
SET email_status = 'subscribed' 
WHERE email_status IS NULL 
  AND email IS NOT NULL 
  AND email != ''
  AND marketing_opt_in = true;
