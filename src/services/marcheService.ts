import { supabase } from '@/lib/supabase'
import { db } from '@/db/database'
import { nanoid } from '@/db/nanoid'
import { withTimeout, type PgResult } from '@/lib/pgTimeout'
import type { PrixMarche, PrixMarcheFormData } from '@/types/marche'

const now = () => new Date().toISOString()

export const marcheService = {
  async getAll(): Promise<PrixMarche[]> {
    return db.prixMarche.orderBy('date').reverse().toArray()
  },

  async getLast(): Promise<PrixMarche | undefined> {
    return db.prixMarche.orderBy('date').last()
  },

  async create(data: PrixMarcheFormData): Promise<PrixMarche> {
    const prix: PrixMarche = { ...data, id: nanoid(), createdAt: now() }
    console.log('[Supabase] insert prix_marche →', prix)

    const { data: inserted, error } = await withTimeout(
      supabase.from('prix_marche').insert(prix).select().single() as PromiseLike<PgResult<PrixMarche>>
    )
    if (error) {
      console.error('[Supabase] insert prix_marche ÉCHEC', error)
      throw new Error(error.message)
    }
    console.log('[Supabase] insert prix_marche ✓', inserted)

    await db.prixMarche.put(prix)
    return prix
  },

  async delete(id: string): Promise<void> {
    console.log('[Supabase] delete prix_marche →', id)

    const { error } = await withTimeout(
      supabase.from('prix_marche').delete().eq('id', id) as PromiseLike<PgResult>
    )
    if (error) {
      console.error('[Supabase] delete prix_marche ÉCHEC', error)
      throw new Error(error.message)
    }
    console.log('[Supabase] delete prix_marche ✓')

    await db.prixMarche.delete(id)
  },
}
