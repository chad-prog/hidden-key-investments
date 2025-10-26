import { createClient } from '@supabase/supabase-js';

// For frontend (Vite), use import.meta.env; for backend, use process.env
// Vite env typing for frontend
interface ImportMetaEnv {
	VITE_SUPABASE_URL: string;
	VITE_SUPABASE_ANON_KEY: string;
}
declare global {
	interface ImportMeta {
		env: ImportMetaEnv;
	}
}

const supabaseUrl = typeof window !== 'undefined'
	? (import.meta.env.VITE_SUPABASE_URL || '')
	: (process.env.SUPABASE_URL || '');
const supabaseAnonKey = typeof window !== 'undefined'
	? (import.meta.env.VITE_SUPABASE_ANON_KEY || '')
	: (process.env.SUPABASE_ANON_KEY || '');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
