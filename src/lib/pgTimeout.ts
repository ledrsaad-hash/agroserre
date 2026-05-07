/** Type de réponse Supabase réduit à l'essentiel */
export type PgResult<T = Record<string, unknown>> = {
  data: T | null
  error: { message: string; code?: string; details?: string } | null
}

/**
 * Impose un timeout sur un thenable Supabase (PostgrestFilterBuilder etc.)
 * qui n'est pas un vrai Promise (pas de catch/finally).
 */
export function withTimeout<T>(thenable: PromiseLike<T>, ms = 8000): Promise<T> {
  return Promise.race([
    Promise.resolve(thenable),
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Délai dépassé (${ms / 1000}s) — vérifiez votre connexion`)),
        ms
      )
    ),
  ])
}
