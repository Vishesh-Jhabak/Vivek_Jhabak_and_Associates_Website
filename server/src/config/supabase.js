const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
// Use service role key on the backend to bypass RLS policies for uploads and signed URLs
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false, // Don't persist session in node backend environment
    }
  });
  console.log('Supabase client initialized successfully for storage.');
} else {
  console.warn('WARNING: Supabase URL or Keys are missing from environment variables. Storage uploads will fail.');
}

module.exports = supabase;
