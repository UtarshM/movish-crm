import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
let supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl) {
  console.error('[supabase-admin] CRITICAL: NEXT_PUBLIC_SUPABASE_URL is missing from .env');
}

if (!supabaseServiceKey) {
  console.warn('[supabase-admin] WARNING: SUPABASE_SERVICE_ROLE_KEY is missing. Falling back to NEXT_PUBLIC_SUPABASE_ANON_KEY. Some administrative operations (like auth.admin) may fail.');
  supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
} else {
  console.log('[supabase-admin] Admin client initialized for:', supabaseUrl);
}

// Admin client with service role for backend operations (bypassing RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
