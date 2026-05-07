import { supabase } from '@/lib/supabase'
import { db } from '@/db/database'
import { nanoid } from '@/db/nanoid'
import { withTimeout, type PgResult } from '@/lib/pgTimeout'
import type { Depense, DepenseFormData } from '@/types/depense'

const now = () => new Date().toISOString()

export const depenseService = {
  async getAll(): Promise<Depense[]> {
    return db.depenses.orderBy('date').reverse().toArray()
  },

  async getBySerre(serreId: string): Promise<Depense[]> {
    return db.depenses.where('serreId').equals(serreId).reverse().sortBy('date')
  },

  async create(data: DepenseFormData): Promise<Depense> {
    const depense: Depense = { ...data, id: nanoid(), createdAt: now(), updatedAt: now() }
    console.log('[Supabase] insert depenses →', depense)

    const { data: inserted, error } = await withTimeout(
      supabase.from('depenses').insert(depense).select().single() as PromiseLike<PgResult<Depense>>
    )
    if (error) {
      console.error('[Supabase] insert depenses ÉCHEC', error)
      throw new Error(error.message)
    }
    console.log('[Supabase] insert depenses ✓', inserted)

    await db.depenses.put(depense)
    return depense
  },

  async update(id: string, data: Partial<DepenseFormData>): Promise<void> {
    const updates = { ...data, updatedAt: now() }
    console.log('[Supabase] update depenses →', id, updates)

    const { error } = await withTimeout(
      supabase.from('depenses').update(updates).eq('id', id) as PromiseLike<PgResult>
    )
    if (error) {
      console.error('[Supabase] update depenses ÉCHEC', error)
      throw new Error(error.message)
    }
    console.log('[Supabase] update depenses ✓')

    await db.depenses.update(id, updates)
  },

  async delete(id: string): Promise<void> {
    console.log('[Supabase] delete depenses →', id)

    const { error } = await withTimeout(
      supabase.from('depenses').delete().eq('id', id) as PromiseLike<PgResult>
    )
    if (error) {
      console.error('[Supabase] delete depenses ÉCHEC', error)
      throw new Error(error.message)
    }
    console.log('[Supabase] delete depenses ✓')

    await db.depenses.delete(id)
  },
}
