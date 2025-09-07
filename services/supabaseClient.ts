import { createClient } from '@supabase/supabase-js';

// FIX: Switched from import.meta.env to process.env as configured in vite.config.ts.
// This resolves the TypeScript errors related to Vite's client types.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and Anon Key must be provided in .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);