import { supabase, getCurrentUserId } from './supabase'

// Fire-and-forget : écrit en Supabase sans bloquer l'UI
// Si hors-ligne ou non connecté → silencieux
export function remoteUpsert(table: string, data: Record<string, unknown>): void {
  const userId = getCurrentUserId()
  if (!userId) return

  supabase
    .from(table)
    .upsert({ ...data, user_id: userId })
    .then(({ error }) => {
      if (error) console.warn(`[Supabase] upsert ${table}:`, error.message)
    })
}

export function remoteDelete(table: string, id: string): void {
  const userId = getCurrentUserId()
  if (!userId) return

  supabase
    .from(table)
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
    .then(({ error }) => {
      if (error) console.warn(`[Supabase] delete ${table}:`, error.message)
    })
}
