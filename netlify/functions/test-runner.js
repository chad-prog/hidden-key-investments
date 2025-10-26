import dotenv from 'dotenv';
dotenv.config({ path: '../../.env.local' });

import { handler as mailchimpHandler } from './mailchimp-sync.js';
import { handler as airtableHandler } from './airtable-sync.js';

async function runTests() {
  console.log('Testing Mailchimp function in demo mode...');
  const testEmail = process.argv[2] || 'test@example.com';
  console.log('Using test email:', testEmail);

  const mailchimpResult = await mailchimpHandler({
    httpMethod: 'POST',
    body: JSON.stringify({
      email: testEmail,
      firstName: 'Test',
      lastName: 'User'
    })
  });
  console.log('Mailchimp response:', JSON.stringify(mailchimpResult, null, 2));

  console.log('\nTesting Airtable function in demo mode...');
  const airtableResult = await airtableHandler({
    httpMethod: 'POST',
    body: JSON.stringify({
      name: 'Test Property',
      price: 500000,
      location: 'Test Location'
    })
  });
  console.log('Airtable response:', JSON.stringify(airtableResult, null, 2));
}

runTests().catch(console.error);