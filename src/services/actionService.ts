import { db } from '@/db/database'
import { nanoid } from '@/db/nanoid'
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
    await db.actions.add(action)
    return action
  },

  async update(id: string, data: Partial<ActionFormData>): Promise<void> {
    await db.actions.update(id, { ...data, updatedAt: now() })
  },

  async delete(id: string): Promise<void> {
    await db.actions.delete(id)
  },
}
