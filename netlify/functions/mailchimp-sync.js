import { fetch } from 'undici';

export async function handler(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    const { email, firstName, lastName, ...additionalFields } = payload;

    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email is required' }),
      };
    }

    const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
    const MAILCHIMP_LIST_ID = process.env.MAILCHIMP_LIST_ID;
    const MAILCHIMP_SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX;

    if (!MAILCHIMP_API_KEY || !MAILCHIMP_LIST_ID || !MAILCHIMP_SERVER_PREFIX) {
      console.log('[mailchimp-sync] Demo mode - payload:', payload);
      return {
        statusCode: 200,
        body: JSON.stringify({ ok: true, demo: true, action: 'simulated-subscribe' }),
      };
    }

    const url = `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members`;
    
    const subscriberData = {
      email_address: email,
      status: 'subscribed',
      merge_fields: {
        FNAME: firstName || '',
        LNAME: lastName || '',
        ...additionalFields,
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `apikey ${MAILCHIMP_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscriberData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Failed to subscribe to Mailchimp');
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        demo: false,
        result: data,
      }),
    };
  } catch (err) {
    console.error('[mailchimp-sync] error:', err);
    return {
      statusCode: err.status || 500,
      body: JSON.stringify({
        ok: false,
        error: err.message || String(err),
      }),
    };
  }
}
