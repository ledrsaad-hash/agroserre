import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Module-level cache mis à jour par onAuthStateChange
// Permet aux services de lire le userId courant de façon synchrone
let _currentUserId: string | null = null

supabase.auth.onAuthStateChange((_event, session) => {
  _currentUserId = session?.user.id ?? null
})

export const getCurrentUserId = (): string | null => _currentUserId

// Initialisation synchrone depuis la session en cache
supabase.auth.getSession().then(({ data }) => {
  _currentUserId = data.session?.user.id ?? null
})
