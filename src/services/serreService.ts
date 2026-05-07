import { supabase } from '@/lib/supabase'
import { db } from '@/db/database'
import { nanoid } from '@/db/nanoid'
import { withTimeout, type PgResult } from '@/lib/pgTimeout'
import type { Serre, SerreFormData } from '@/types/serre'

const now = () => new Date().toISOString()

export const serreService = {
  async getAll(): Promise<Serre[]> {
    return db.serres.orderBy('createdAt').reverse().toArray()
  },

  async getById(id: string): Promise<Serre | undefined> {
    return db.serres.get(id)
  },

  async create(data: SerreFormData): Promise<Serre> {
    const serre: Serre = { ...data, id: nanoid(), createdAt: now(), updatedAt: now() }
    console.log('[Supabase] insert serres →', serre)

    const { data: inserted, error } = await withTimeout(
      supabase.from('serres').insert(serre).select().single() as PromiseLike<PgResult<Serre>>
    )
    if (error) {
      console.error('[Supabase] insert serres ÉCHEC', error)
      throw new Error(error.message)
    }
    console.log('[Supabase] insert serres ✓', inserted)

    await db.serres.put(serre)
    return serre
  },

  async update(id: string, data: Partial<SerreFormData>): Promise<void> {
    const updates = { ...data, updatedAt: now() }
    console.log('[Supabase] update serres →', id, updates)

    const { error } = await withTimeout(
      supabase.from('serres').update(updates).eq('id', id) as PromiseLike<PgResult>
    )
    if (error) {
      console.error('[Supabase] update serres ÉCHEC', error)
      throw new Error(error.message)
    }
    console.log('[Supabase] update serres ✓')

    await db.serres.update(id, updates)
  },

  async delete(id: string): Promise<void> {
    console.log('[Supabase] delete serres →', id)

    const { error } = await withTimeout(
      supabase.from('serres').delete().eq('id', id) as PromiseLike<PgResult>
    )
    if (error) {
      console.error('[Supabase] delete serres ÉCHEC', error)
      throw new Error(error.message)
    }
    console.log('[Supabase] delete serres ✓')

    await db.transaction('rw', [db.serres, db.depenses, db.actions, db.intrants], async () => {
      await db.serres.delete(id)
      await db.depenses.where('serreId').equals(id).delete()
      await db.actions.where('serreId').equals(id).delete()
      await db.intrants.where('serreId').equals(id).delete()
    })
  },
}
