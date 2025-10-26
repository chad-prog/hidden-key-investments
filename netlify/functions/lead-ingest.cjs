// Lead ingestion endpoint with validation and Supabase DB
const zod = require('zod');
const { supabase } = require('./supabaseClient.cjs');

const LeadSchema = zod.object({
  name: zod.string().min(1, 'Name is required'),
  email: zod.string().email('Valid email required'),
  phone: zod.string().optional(),
  source: zod.string().optional(),
  notes: zod.string().optional()
});

exports.handler = async function(event, context) {
  if (event.httpMethod === 'POST') {
    let data;
    try {
      data = JSON.parse(event.body || '{}');
    } catch (err) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid JSON body' })
      };
    }
    const result = LeadSchema.safeParse(data);
    if (!result.success) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: result.error.errors.map(e => e.message) })
      };
    }
    // Store lead in Supabase
    const lead = { ...result.data, created: new Date().toISOString() };
    const { error, data: inserted } = await supabase.from('leads').insert([lead]);
    if (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message })
      };
    }
    // Trigger workflow function (fire-and-forget)
    try {
      await fetch('http://localhost:8888/.netlify/functions/workflow', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lead }) });
    } catch (err) {
      // Log but don't block lead creation
      console.error('Workflow trigger failed:', err);
    }
    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'Lead received', lead: inserted && inserted[0] ? inserted[0] : lead })
    };
  }
  // GET returns all leads from Supabase
  if (event.httpMethod === 'GET') {
    const { data: leads, error } = await supabase.from('leads').select('*').order('created', { ascending: false });
    if (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message })
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ leads })
    };
  }
  // Method not allowed
  return {
    statusCode: 405,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};