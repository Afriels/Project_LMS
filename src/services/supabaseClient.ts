import { createClient } from '@supabase/supabase-js';

// The Supabase client is configured to use environment variables via `process.env`.
// Fallback credentials are provided to prevent crashes when a .env file is not available.
// Vite replaces process.env.VAR with JSON.stringify(env.VAR), which can result in the string 'undefined'.
const supabaseUrl = (process.env.SUPABASE_URL && process.env.SUPABASE_URL !== 'undefined') 
    ? process.env.SUPABASE_URL 
    : 'https://wcpyvlyfxfppfagsmhfb.supabase.co';

const supabaseAnonKey = (process.env.SUPABASE_ANON_KEY && process.env.SUPABASE_ANON_KEY !== 'undefined')
    ? process.env.SUPABASE_ANON_KEY
    : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjcHl2bHlmeGZwcGZhZ3NtaGZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNzI1NTYsImV4cCI6MjA3Mjc0ODU1Nn0.tsROhbTbQMVr7wAOcjH_GR6FhhVNwkjT2MnftuhZqY8';


if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and Anon Key must be provided either in a .env file or as fallbacks in supabaseClient.ts.");
}


export const supabase = createClient(supabaseUrl, supabaseAnonKey);