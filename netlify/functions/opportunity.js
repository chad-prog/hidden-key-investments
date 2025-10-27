// Opportunity endpoint with Supabase CRUD
const zod = require('zod');
const { supabase } = require('./supabaseClient.cjs');
const validStages = ['new', 'review', 'negotiation', 'closed', 'lost'];

const OpportunitySchema = zod.object({
  title: zod.string().min(1, 'Title is required'),
  value: zod.number().min(0, 'Value must be positive'),
  stage: zod.string().optional(),
  notes: zod.string().optional()
});

exports.handler = async function(event) {
  if (event.httpMethod === 'POST') {
    let data;
    try { 
      data = JSON.parse(event.body || '{}'); 
    } catch {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
    }
    const result = OpportunitySchema.safeParse(data);
    if (!result.success) {
      return { statusCode: 400, body: JSON.stringify({ error: result.error.errors.map(e => e.message) }) };
    }
    // Check for duplicate title in Supabase
    const { data: existing, error: dupError } = await supabase.from('opportunities').select('id').eq('title', result.data.title);
    if (dupError) {
      return { statusCode: 500, body: JSON.stringify({ error: dupError.message }) };
    }
    if (existing && existing.length > 0) {
      return { statusCode: 409, body: JSON.stringify({ error: 'Duplicate opportunity title' }) };
    }
    // Validate stage
    if (result.data.stage && !validStages.includes(result.data.stage)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid stage' }) };
    }
    const opp = { ...result.data, created: new Date().toISOString() };
    const { error, data: inserted } = await supabase.from('opportunities').insert([opp]);
    if (error) {
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
    return { statusCode: 201, body: JSON.stringify({ message: 'Opportunity created', opportunity: inserted && inserted[0] ? inserted[0] : opp }) };
  }
  if (event.httpMethod === 'GET') {
    const { data: opportunities, error } = await supabase.from('opportunities').select('*').order('created', { ascending: false });
    if (error) {
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
    return { statusCode: 200, body: JSON.stringify({ opportunities }) };
  }
  if (event.httpMethod === 'DELETE') {
    let data;
    try { 
      data = JSON.parse(event.body || '{}'); 
    } catch {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
    }
    const { id } = data;
    const { error } = await supabase.from('opportunities').delete().eq('id', id);
    if (error) {
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
    return { statusCode: 200, body: JSON.stringify({ message: 'Opportunity deleted', id }) };
  }
  // PATCH for stage transition
  if (event.httpMethod === 'PATCH') {
    let data;
    try { 
      data = JSON.parse(event.body || '{}'); 
    } catch {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
    }
    const { id, stage } = data;
    if (!validStages.includes(stage)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid stage' }) };
    }
    const { data: updated, error } = await supabase.from('opportunities').update({ stage }).eq('id', id).select();
    if (error) {
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
    if (!updated || updated.length === 0) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Opportunity not found' }) };
    }
    return { statusCode: 200, body: JSON.stringify({ message: 'Stage updated', opportunity: updated[0] }) };
  }
  return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
};
