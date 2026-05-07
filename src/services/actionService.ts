import { supabase } from '@/lib/supabase'
import { db } from '@/db/database'
import { nanoid } from '@/db/nanoid'
import { withTimeout, type PgResult } from '@/lib/pgTimeout'
import type { Action, ActionFormData } from '@/types/action'

const now = () => new Date().toISOString()

export const actionService = {
  async getAll(): Promise<Action[]> {
    return db.actions.orderBy('date').reverse().toArray()
  },

  async getBySerre(serreId: string): Promise<Action[]> {
    return db.actions.where('serreId').equals(serreId).reverse().sortBy('date')
  },

  async create(data: ActionFormData): Promise<Action> {
    const action: Action = { ...data, id: nanoid(), createdAt: now(), updatedAt: now() }
    console.log('[Supabase] insert actions →', action)

    const { data: inserted, error } = await withTimeout(
      supabase.from('actions').insert(action).select().single() as PromiseLike<PgResult<Action>>
    )
    if (error) {
      console.error('[Supabase] insert actions ÉCHEC', error)
      throw new Error(error.message)
    }
    console.log('[Supabase] insert actions ✓', inserted)

    await db.actions.put(action)
    return action
  },

  async update(id: string, data: Partial<ActionFormData>): Promise<void> {
    const updates = { ...data, updatedAt: now() }
    console.log('[Supabase] update actions →', id, updates)

    const { error } = await withTimeout(
      supabase.from('actions').update(updates).eq('id', id) as PromiseLike<PgResult>
    )
    if (error) {
      console.error('[Supabase] update actions ÉCHEC', error)
      throw new Error(error.message)
    }
    console.log('[Supabase] update actions ✓')

    await db.actions.update(id, updates)
  },

  async delete(id: string): Promise<void> {
    console.log('[Supabase] delete actions →', id)

    const { error } = await withTimeout(
      supabase.from('actions').delete().eq('id', id) as PromiseLike<PgResult>
    )
    if (error) {
      console.error('[Supabase] delete actions ÉCHEC', error)
      throw new Error(error.message)
    }
    console.log('[Supabase] delete actions ✓')

    await db.actions.delete(id)
  },
}
