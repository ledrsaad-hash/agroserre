import { supabase } from '@/lib/supabase'
import { db } from '@/db/database'
import { nanoid } from '@/db/nanoid'
import { withTimeout, type PgResult } from '@/lib/pgTimeout'
import type { Vente, VenteFormData } from '@/types/vente'

const now = () => new Date().toISOString()

export const venteService = {
  async getAll(): Promise<Vente[]> {
    return db.ventes.orderBy('date').reverse().toArray()
  },

  async getBySerre(serreId: string): Promise<Vente[]> {
    const all = await db.ventes.toArray()
    return all
      .filter(v => v.serreIds.includes(serreId))
      .sort((a, b) => b.date.localeCompare(a.date))
  },

  async getById(id: string): Promise<Vente | undefined> {
    return db.ventes.get(id)
  },

  async create(data: VenteFormData): Promise<Vente> {
    const vente: Vente = { ...data, id: nanoid(), createdAt: now(), updatedAt: now() }
    console.log('[Supabase] insert ventes →', vente)

    const { data: inserted, error } = await withTimeout(
      supabase.from('ventes').insert(vente).select().single() as PromiseLike<PgResult<Vente>>
    )
    if (error) {
      console.error('[Supabase] insert ventes ÉCHEC', error)
      throw new Error(error.message)
    }
    console.log('[Supabase] insert ventes ✓', inserted)

    await db.ventes.put(vente)
    return vente
  },

  async update(id: string, data: Partial<VenteFormData>): Promise<void> {
    const updates = { ...data, updatedAt: now() }
    console.log('[Supabase] update ventes →', id, updates)

    const { error } = await withTimeout(
      supabase.from('ventes').update(updates).eq('id', id) as PromiseLike<PgResult>
    )
    if (error) {
      console.error('[Supabase] update ventes ÉCHEC', error)
      throw new Error(error.message)
    }
    console.log('[Supabase] update ventes ✓')

    await db.ventes.update(id, updates)
  },

  async delete(id: string): Promise<void> {
    console.log('[Supabase] delete ventes →', id)

    const { error } = await withTimeout(
      supabase.from('ventes').delete().eq('id', id) as PromiseLike<PgResult>
    )
    if (error) {
      console.error('[Supabase] delete ventes ÉCHEC', error)
      throw new Error(error.message)
    }
    console.log('[Supabase] delete ventes ✓')

    await db.ventes.delete(id)
  },
}
