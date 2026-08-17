import { createClient } from '@supabase/supabase-js'

// You'll fill these in once your Supabase project is created.
// They come from: Project Settings → API → Project URL / anon public key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
