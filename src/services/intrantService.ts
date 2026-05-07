import { supabase } from '@/lib/supabase'
import { db } from '@/db/database'
import { nanoid } from '@/db/nanoid'
import { withTimeout, type PgResult } from '@/lib/pgTimeout'
import type { Intrant, IntrantFormData } from '@/types/intrant'

const now = () => new Date().toISOString()

export const intrantService = {
  async getAll(): Promise<Intrant[]> {
    return db.intrants.orderBy('date').reverse().toArray()
  },

  async getBySerre(serreId: string): Promise<Intrant[]> {
    return db.intrants.where('serreId').equals(serreId).reverse().sortBy('date')
  },

  async create(data: IntrantFormData): Promise<Intrant> {
    const intrant: Intrant = { ...data, id: nanoid(), createdAt: now(), updatedAt: now() }
    console.log('[Supabase] insert intrants →', intrant)

    const { data: inserted, error } = await withTimeout(
      supabase.from('intrants').insert(intrant).select().single() as PromiseLike<PgResult<Intrant>>
    )
    if (error) {
      console.error('[Supabase] insert intrants ÉCHEC', error)
      throw new Error(error.message)
    }
    console.log('[Supabase] insert intrants ✓', inserted)

    await db.intrants.put(intrant)
    return intrant
  },

  async update(id: string, data: Partial<IntrantFormData>): Promise<void> {
    const updates = { ...data, updatedAt: now() }
    console.log('[Supabase] update intrants →', id, updates)

    const { error } = await withTimeout(
      supabase.from('intrants').update(updates).eq('id', id) as PromiseLike<PgResult>
    )
    if (error) {
      console.error('[Supabase] update intrants ÉCHEC', error)
      throw new Error(error.message)
    }
    console.log('[Supabase] update intrants ✓')

    await db.intrants.update(id, updates)
  },

  async delete(id: string): Promise<void> {
    console.log('[Supabase] delete intrants →', id)

    const { error } = await withTimeout(
      supabase.from('intrants').delete().eq('id', id) as PromiseLike<PgResult>
    )
    if (error) {
      console.error('[Supabase] delete intrants ÉCHEC', error)
      throw new Error(error.message)
    }
    console.log('[Supabase] delete intrants ✓')

    await db.intrants.delete(id)
  },
}
