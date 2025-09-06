import { createClient } from '@supabase/supabase-js';

// Using the credentials provided by the user to establish the Supabase connection.
const supabaseUrl = 'https://wcpyvlyfxfppfagsmhfb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjcHl2bHlmeGZwcGZhZ3NtaGZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNzI1NTYsImV4cCI6MjA3Mjc0ODU1Nn0.tsROhbTbQMVr7wAOcjH_GR6FhhVNwkjT2MnftuhZqY8';

if (!supabaseUrl || !supabaseAnonKey) {
    // This check is unlikely to fail now but is kept as a safeguard.
    throw new Error("Supabase URL and Anon Key must be provided.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
