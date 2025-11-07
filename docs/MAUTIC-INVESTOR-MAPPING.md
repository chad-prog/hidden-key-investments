# Mautic Mapping for Investor Flow

Purpose: map HKI lead/investor fields to Mautic contact fields for the Investor Welcome flow.

Recommended mappings (HKI -> Mautic):
- email -> email
- firstName -> first_name
- lastName -> last_name
- phone -> mobile (or phone)
- ml.score -> custom field: hki_score
- crm_status -> stage (or custom crm_status)
- consent.marketing_opt_in -> do_not_contact / custom field
- utm.source -> utm_source
- utm.medium -> utm_medium
- utm.campaign -> utm_campaign
- investor profile fields (experience, capitalRange) -> custom fields: investor_experience, investor_capital_range

Mautic campaign & segment recommendations:
- Campaign: "Investor Welcome — Elite Track" (MAUTIC_CAMPAIGN_INVESTOR_WELCOME)
- Segment: "New Investors" (segment applied on contact creation)
- Use campaign decision nodes to test email sends, delays, and SMS triggers

Webhook events to handle (already in mautic-webhook):
- unsubscribe -> mark Supabase lead as unsubscribed
- bounce -> mark email_status = bounced
- complaint -> mark email_status = complained

Notes:
- Preserve UTM values on updates (do not overwrite if empty)
- Ensure Mautic custom field names match the ones used in src/lib/mappers/hkiToMautic.ts
