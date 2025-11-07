# Investor Experience Master Flow

This document encodes the "Investor Experience Master Flow" into an actionable plan for Hidden Key Investments (HKI). It should be used as the single source of truth for onboarding, nurturing, and converting investor leads.

Contents
- Overview & objectives
- Journey map & system actions
- Welcome sequence (summary) — full copy in INVESTOR-WELCOME-SEQUENCE.md
- Implementation plan (tech components)
- Metrics & testing
- Next steps / deliverables

## Overview & Objectives
Purpose: convert inbound leads into qualified investors through a high-trust, high-touch automated experience that respects preferences and preserves deliverability.

Goals:
- Build credibility and trust via an education-first welcome sequence
- Capture investor preferences & segment for targeted opportunity alerts
- Sync leads to Mautic for campaigns and to Supabase for CRM
- Use SendGrid for deliverability and tracking, support unsubscribe and plain text versions

Brand: tone = professional, trustworthy, exclusive (see docs/brand guidelines)

Personalization fields:
- {{investor.firstName}}, {{investor.lastName}}, {{opportunity.address}}, {{opportunity.value}}, {{user.name}}

Constraints:
- Table-based layouts where needed, inline CSS, < 600px width
- Plain-text fallback
- Unsubscribe link & tracking pixel
- Support Handlebars-style merge tags
- Pass spam filters

## Investor Journey (high-level)
1. Visitor -> Intake form (frontend)
   - Track via mautic.js + page pixel
   - Validation & immediate lead creation in Supabase

2. Lead created -> Immediate welcome flow
   - Push to Mautic contacts (mautic-sync)
   - Enroll in "Investor Welcome" Mautic campaign
   - Start 3-email welcome sequence + SMS micro-followups

3. Scoring & qualification
   - ML score engine updates via ml-score.ts
   - Move to pipeline stages and trigger reminders (email/SMS)

4. Opportunity & conversion
   - Curated deal announcements to segmented list
   - Signing & onboarding workflows (document requests)

5. Long-term relationship
   - Quarterly updates, newsletters, portal access

## Welcome Sequence (summary)
- Email #1 — Welcome + Why We Exist (immediate)
- Email #2 — How We Reduce Risk (48h)
- Email #3 — Call-to-Action: Strategy Call (72h)
See docs/INVESTOR-WELCOME-SEQUENCE.md for full copy + merge tag usage.

## System Components (implementation)
- Frontend: React intake form (multi-step)
- Backend: Netlify Functions
  - mautic-sync (existing)
  - mautic-webhook (existing)
  - investor-onboard (new) — handles intake + enrichment + campaign enrollment
- CRM: Supabase leads table
- Marketing automation: Mautic campaigns & segments
- Email/SMS: SendGrid (email), Twilio (SMS)
- Testing: Litmus / Email on Acid for templates

## Deliverables
- Email templates (HTML + plain text)
- Docs (this file + welcome sequence copy)
- Netlify function: investor-onboard
- Mautic mapping doc
- Test results (Litmus screenshots & scores)
- Integration guide for developers + marketers

## Metrics to track
- Lead to email-open conversion
- Welcome sequence open and click-through rates
- Click-to-book conversion rate
- Campaign unsubscribe and complaint rates
- Deliverability (bounces) and Litmus scores

## Testing & QA
- Validate merge tag substitution with sample lead records
- Litmus test rendering in Outlook, Gmail, Apple Mail, iOS/Android
- Spam-check with Mail Tester or internal spam tools
- Verify unsubscribe events are handled by mautic-webhook and update Supabase

## Next steps
1. Add the provided email templates and plain text versions to src/email-templates
2. Add netlify/functions/investor-onboard.ts and wire to the intake form
3. Import campaign names & IDs into environment config and set MAUTIC_CAMPAIGN_INVESTOR_WELCOME
4. Create Mautic campaign "Investor Welcome — Elite Track" and enable webhook events
5. Run Litmus tests and iterate
