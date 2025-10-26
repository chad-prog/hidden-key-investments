// Investor endpoint with in-memory CRUD
const zod = require('zod');
const { supabase } = require('./supabaseClient.cjs');

const InvestorSchema = zod.object({
  name: zod.string().min(1, 'Name is required'),
  email: zod.string().email('Valid email required'),
  accredited: zod.boolean().optional(),
  notes: zod.string().optional()
});

exports.handler = async function(event, context) {
  if (event.httpMethod === 'POST') {
    let data;
    try { data = JSON.parse(event.body || '{}'); } catch (err) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
    }
    const result = InvestorSchema.safeParse(data);
    if (!result.success) {
      return { statusCode: 400, body: JSON.stringify({ error: result.error.errors.map(e => e.message) }) };
    }
    // Check for duplicate email in Supabase
    const { data: existing, error: dupError } = await supabase.from('investors').select('id').eq('email', result.data.email);
    if (dupError) {
      return { statusCode: 500, body: JSON.stringify({ error: dupError.message }) };
    }
    if (existing && existing.length > 0) {
      return { statusCode: 409, body: JSON.stringify({ error: 'Duplicate investor email' }) };
    }
    // Accreditation check
    if (result.data.accredited !== undefined && typeof result.data.accredited !== 'boolean') {
      return { statusCode: 400, body: JSON.stringify({ error: 'Accredited must be boolean' }) };
    }
    const investor = { ...result.data, created: new Date().toISOString() };
    const { error, data: inserted } = await supabase.from('investors').insert([investor]);
    if (error) {
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
    return { statusCode: 201, body: JSON.stringify({ message: 'Investor created', investor: inserted && inserted[0] ? inserted[0] : investor }) };
  }
  if (event.httpMethod === 'GET') {
    const { data: investors, error } = await supabase.from('investors').select('*').order('created', { ascending: false });
    if (error) {
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
    return { statusCode: 200, body: JSON.stringify({ investors }) };
  }
  if (event.httpMethod === 'DELETE') {
    let data;
    try { data = JSON.parse(event.body || '{}'); } catch (err) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
    }
    const { id } = data;
    const { error } = await supabase.from('investors').delete().eq('id', id);
    if (error) {
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
    return { statusCode: 200, body: JSON.stringify({ message: 'Investor deleted', id }) };
  }
  return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
};