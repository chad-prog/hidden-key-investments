import React, { useState } from 'react';

interface Lead {
  name: string;
  email: string;
  phone?: string;
  source?: string;
  notes?: string;
}

const LeadForm: React.FC = () => {
  const [form, setForm] = useState<Lead>({ name: '', email: '', phone: '', source: '', notes: '' });
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setError(null);
    try {
      const res = await fetch('/.netlify/functions/lead-ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.status === 201) {
        setStatus('Lead submitted successfully!');
        setForm({ name: '', email: '', phone: '', source: '', notes: '' });
      } else {
        setError(data.error ? data.error.join(', ') : 'Submission failed');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-2">Submit a Lead</h2>
      <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required className="w-full p-2 border rounded" />
      <input name="email" value={form.email} onChange={handleChange} placeholder="Email" required className="w-full p-2 border rounded" type="email" />
      <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="w-full p-2 border rounded" />
      <input name="source" value={form.source} onChange={handleChange} placeholder="Source" className="w-full p-2 border rounded" />
      <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Notes" className="w-full p-2 border rounded" />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Submit</button>
      {status && <div className="text-green-600 mt-2">{status}</div>}
      {error && <div className="text-red-600 mt-2">{error}</div>}
    </form>
  );
};

export default LeadForm;
