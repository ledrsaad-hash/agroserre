import { supabase, getCurrentUserId } from './supabase'
import { emitSyncError } from './syncErrors'

const TIMEOUT_MS = 8000

type PgResult = { error: { message: string; code?: string } | null }

/**
 * Wrap a PromiseLike (thenable) with a hard timeout.
 * Accepts PromiseLike so Supabase builders (not full Promises) work too.
 */
function withTimeout<T>(thenable: PromiseLike<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    Promise.resolve(thenable),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout "${label}" après ${ms}ms`)), ms)
    ),
  ])
}

/**
 * Résout le userId sans risque de blocage :
 * 1. Lit le cache synchrone (rempli par onAuthStateChange — jamais bloquant).
 * 2. Si null (premier appel avant résolution du cache), tente getSession()
 *    avec un timeout de 3 s.
 */
async function resolveUserId(): Promise<string | null> {
  const cached = getCurrentUserId()
  if (cached) return cached

  try {
    const { data } = await withTimeout(supabase.auth.getSession(), 3000, 'getSession')
    return data.session?.user.id ?? null
  } catch (e) {
    console.error('[Supabase] resolveUserId timeout/erreur:', e)
    return null
  }
}

/**
 * Upsert en Supabase — garanties :
 * - timeout dur de 8 s (ne bloque jamais le formulaire)
 * - toutes les erreurs sont loguées et affichées dans la bannière
 * - ne throw jamais vers l'appelant
 */
export async function remoteUpsert(table: string, data: Record<string, unknown>): Promise<void> {
  const userId = await resolveUserId()

  if (!userId) {
    console.warn(`[Supabase] upsert "${table}" ignoré — pas de session`)
    emitSyncError('Enregistré localement, mais non synchronisé (session expirée ou absente)')
    return
  }

  const payload = { ...data, user_id: userId }
  console.log(`[Supabase] upsert → "${table}"`, JSON.stringify(payload))

  try {
    const result = await withTimeout<PgResult>(
      supabase.from(table).upsert(payload) as PromiseLike<PgResult>,
      TIMEOUT_MS,
      `upsert ${table}`
    )

    if (result.error) {
      console.error(`[Supabase] upsert "${table}" ÉCHEC`, result.error)
      emitSyncError(`Enregistré localement, non synchronisé (${result.error.message})`)
    } else {
      console.log(`[Supabase] upsert "${table}" ✓`)
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error(`[Supabase] upsert "${table}" exception:`, e)
    emitSyncError(`Enregistré localement, non synchronisé (${msg})`)
  }
}

/**
 * Delete en Supabase — mêmes garanties de non-blocage.
 */
export async function remoteDelete(table: string, id: string): Promise<void> {
  const userId = await resolveUserId()

  if (!userId) {
    console.warn(`[Supabase] delete "${table}" ignoré — pas de session`)
    return
  }

  console.log(`[Supabase] delete → "${table}" id=${id}`)

  try {
    const result = await withTimeout<PgResult>(
      supabase.from(table).delete().eq('id', id).eq('user_id', userId) as PromiseLike<PgResult>,
      TIMEOUT_MS,
      `delete ${table}`
    )

    if (result.error) {
      console.error(`[Supabase] delete "${table}" ÉCHEC`, result.error)
      emitSyncError(`Suppression non synchronisée (${result.error.message})`)
    } else {
      console.log(`[Supabase] delete "${table}" ✓`)
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error(`[Supabase] delete "${table}" exception:`, e)
    emitSyncError(`Suppression non synchronisée (${msg})`)
  }
}
