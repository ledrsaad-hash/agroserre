import { db } from '@/db/database'
import { nanoid } from '@/db/nanoid'
import { remoteUpsert, remoteDelete } from '@/lib/remoteWriter'
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
    await db.depenses.add(depense)
    remoteUpsert('depenses', depense as unknown as Record<string, unknown>)
    return depense
  },

  async update(id: string, data: Partial<DepenseFormData>): Promise<void> {
    await db.depenses.update(id, { ...data, updatedAt: now() })
    const full = await db.depenses.get(id)
    if (full) remoteUpsert('depenses', full as unknown as Record<string, unknown>)
  },

  async delete(id: string): Promise<void> {
    await db.depenses.delete(id)
    remoteDelete('depenses', id)
  },
}
