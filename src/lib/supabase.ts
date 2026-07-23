import { createClient } from '@supabase/supabase-js'

// Reads Supabase project URL & anon key from environment varibles (set in .env locally, Vercel in production)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env file.')
}

// Single shared Supabase client used throughout the app for auth + database queries
export const supabase = createClient(supabaseUrl, supabaseAnonKey)