import { supabase } from './supabase'
import { emitSyncError } from './syncErrors'

/**
 * Récupère le userId depuis la session Supabase directement (pas le cache module).
 * Évite la race condition au démarrage où le cache n'est pas encore rempli.
 */
async function getSessionUserId(): Promise<string | null> {
  const { data, error } = await supabase.auth.getSession()
  if (error) {
    console.error('[Supabase] getSession error:', error.message)
    return null
  }
  return data.session?.user.id ?? null
}

export async function remoteUpsert(table: string, data: Record<string, unknown>): Promise<void> {
  const userId = await getSessionUserId()

  if (!userId) {
    console.warn(`[Supabase] remoteUpsert "${table}" ignoré : pas de session utilisateur`)
    return
  }

  const payload = { ...data, user_id: userId }
  console.log(`[Supabase] upsert → "${table}"`, payload)

  const { error } = await supabase.from(table).upsert(payload)

  if (error) {
    console.error(`[Supabase] upsert "${table}" ÉCHEC:`, error)
    emitSyncError(`Sync "${table}" échoué : ${error.message}`)
    throw new Error(error.message)
  }

  console.log(`[Supabase] upsert "${table}" ✓`)
}

export async function remoteDelete(table: string, id: string): Promise<void> {
  const userId = await getSessionUserId()

  if (!userId) {
    console.warn(`[Supabase] remoteDelete "${table}" ignoré : pas de session utilisateur`)
    return
  }

  console.log(`[Supabase] delete → "${table}" id=${id}`)

  const { error } = await supabase.from(table).delete().eq('id', id).eq('user_id', userId)

  if (error) {
    console.error(`[Supabase] delete "${table}" ÉCHEC:`, error)
    emitSyncError(`Suppression "${table}" échouée : ${error.message}`)
    throw new Error(error.message)
  }

  console.log(`[Supabase] delete "${table}" ✓`)
}
