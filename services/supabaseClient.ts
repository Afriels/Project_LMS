import { createClient } from '@supabase/supabase-js';

// The Supabase client is configured to use environment variables via `process.env`.
// Vite replaces these, so we check for the variable being missing OR the literal string 'undefined'.
const supabaseUrl = (process.env.SUPABASE_URL && process.env.SUPABASE_URL !== 'undefined')
    ? process.env.SUPABASE_URL
    : 'https://wcpyvlyfxfppfagsmhfb.supabase.co';

const supabaseAnonKey = (process.env.SUPABASE_ANON_KEY && process.env.SUPABASE_ANON_KEY !== 'undefined')
    ? process.env.SUPABASE_ANON_KEY
    : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjcHl2bHlmeGZwcGZhZ3NtaGZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNzI1NTYsImV4cCI6MjA3Mjc0ODU1Nn0.tsROhbTbQMVr7wAOcjH_GR6FhhVNwkjT2MnftuhZqY8';

// This provides a clear message if the fallback credentials are still not working for some reason,
// but it no longer throws an error that causes a white screen.
if (!supabaseUrl || !supabaseAnonKey) {
    console.error("CRITICAL: Supabase credentials are not configured. Please set them in your .env file or check the fallback values in supabaseClient.ts");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
