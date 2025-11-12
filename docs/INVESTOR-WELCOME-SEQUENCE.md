# Investor Welcome Sequence (HKI)

This document contains the 3-email welcome sequence and the recommended SMS micro-follow-ups. Use Handlebars-style merge tags ({{investor.firstName}}) and ensure a plain-text fallback is available.

## Sequence Overview
- Trigger: lead creation & Mautic enrollment in "Investor Welcome — Elite Track"
- Timing:
  - Email #1: Immediately
  - Email #2: 48 hours after Email #1
  - Email #3: 72 hours after Email #2 (or after Email #2 based on schedule)
- SMS: Micro-follow-up messages to increase booking rate

## Email #1 — Welcome + Why We Exist
Subject: Welcome — Let's Create Wealth The Smart Way
Send: Immediately

Body (use HTML template `src/email-templates/welcome.mjml` / text `src/email-templates/welcome.txt`):
- Greeting: Hi {{investor.firstName}},
- Introduce HKI mission, value prop (off-market, professionally underwritten multi-family)
- Bullet points: preserve capital, produce cash flow, long-term appreciation
- Link: "What to expect next" (trackable link)
- CTA: None aggressive — invite to learn & confirm interest
- Footer: Unsubscribe, privacy, logo (alt text), tracking pixel

## Email #2 — How We Reduce Risk
Subject: How We Reduce Risk Before We Ever Enter a Deal
Send: 48 hours after Email #1

Body:
- Explain underwriting approach: worst-case first, multiple exit scenarios
- Provide bullets & a short downloadable PDF / blog link (track clicks)
- CTA: Invite to reply or schedule a 15-min strategy call

## Email #3 — Strategy Call Invitation
Subject: Let's Talk About Your Goals
Send: 72 hours after Email #2

Body:
- Short personal note (from {{user.name}})
- Link to booking: {{booking_link}} (tracking params)
- Emphasize low-pressure, 15 minutes

## SMS Micro-Follow-Up
- SMS #1 (immediately after lead capture):
  "Hi {{investor.firstName}}, this is Chad from Hidden Key Investments — thanks for reaching out! I'll send a few resources shortly. Quick question: are you more focused on cash flow or long-term equity?"
- SMS #2 (48 hrs if no reply / no booking):
  "Hey {{investor.firstName}}, still here if you'd like to chat strategy. Want me to send a deal evaluation breakdown?"

## Merge Tag Guidance
- Use Handlebars-style tags: {{investor.firstName}}, {{investor.lastName}}, {{user.name}}, {{booking_link}}
- Ensure Mautic fields map to these variables (see docs/MAUTIC-INVESTOR-MAPPING.md)

## Deliverability Best Practices
- Keep HTML width <= 600px, inline CSS, use table-based layout where compatibility is required
- Include plain text version
- Add List-Unsubscribe header via SendGrid
- Add tracking pixel and UTM parameters to links
- Add alt text for logo / images
