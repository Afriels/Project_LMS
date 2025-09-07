import { createClient } from '@supabase/supabase-js';

// The Supabase client is configured to use environment variables via `process.env`.
// Vite replaces process.env.VAR with JSON.stringify(env.VAR), which can result in the string 'undefined'.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Ensure that the environment variables are not just present, but also not the string 'undefined'.
if (!supabaseUrl || supabaseUrl === 'undefined' || !supabaseAnonKey || supabaseAnonKey === 'undefined') {
    // This error will be caught during development if the .env file is missing or misconfigured.
    // It provides a clear message to the developer about what needs to be fixed.
    throw new Error("Supabase URL and Anon Key must be provided in .env file.");
}


export const supabase = createClient(supabaseUrl, supabaseAnonKey);
