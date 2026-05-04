import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { syncService } from '@/services/syncService'

interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  needsMigration: boolean
  syncing: boolean
  signInWithPassword: (email: string, password: string) => Promise<string | null>
  signInWithMagicLink: (email: string) => Promise<string | null>
  signUp: (email: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>
  acceptMigration: () => Promise<void>
  skipMigration: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]                   = useState<User | null>(null)
  const [session, setSession]             = useState<Session | null>(null)
  const [loading, setLoading]             = useState(true)
  const [needsMigration, setNeedsMigration] = useState(false)
  const [syncing, setSyncing]             = useState(false)

  const handleSignedIn = useCallback(async (newUser: User) => {
    setSyncing(true)
    try {
      const [hasRemote, hasLocal] = await Promise.all([
        syncService.hasRemoteData(newUser.id),
        syncService.hasLocalData(),
      ])

      if (!hasRemote && hasLocal) {
        // Première connexion avec des données locales → proposer migration
        setNeedsMigration(true)
      } else if (hasRemote) {
        // Données cloud existantes → synchroniser vers local
        await syncService.pullFromSupabase(newUser.id)
      }
    } finally {
      setSyncing(false)
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      if (session?.user) handleSignedIn(session.user)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
        if (session?.user && _event === 'SIGNED_IN') {
          await handleSignedIn(session.user)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [handleSignedIn])

  const signInWithPassword = async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error?.message ?? null
  }

  const signInWithMagicLink = async (email: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })
    return error?.message ?? null
  }

  const signUp = async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    })
    return error?.message ?? null
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setNeedsMigration(false)
  }

  const acceptMigration = async () => {
    if (!user) return
    setSyncing(true)
    try {
      await syncService.pushLocalToSupabase(user.id)
      setNeedsMigration(false)
    } finally {
      setSyncing(false)
    }
  }

  const skipMigration = () => setNeedsMigration(false)

  return (
    <AuthContext.Provider value={{
      user, session, loading, needsMigration, syncing,
      signInWithPassword, signInWithMagicLink, signUp,
      signOut, acceptMigration, skipMigration,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
