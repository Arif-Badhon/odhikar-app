import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use NEXT_PUBLIC_ variables for Next.js, with fallback to standard variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "https://placeholder.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";

if (SUPABASE_URL === "https://placeholder.supabase.co") {
  console.warn("Missing Supabase environment variables. Make sure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set for admin functionality.");
}

// Create a supabase admin client with service role key for bypassing RLS
export const supabaseAdmin = createClient<Database>(
  SUPABASE_URL as string,
  SUPABASE_SERVICE_ROLE_KEY as string
);
