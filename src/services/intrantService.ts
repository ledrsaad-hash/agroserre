import { db } from '@/db/database'
import { nanoid } from '@/db/nanoid'
import { remoteUpsert, remoteDelete } from '@/lib/remoteWriter'
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
    await db.intrants.add(intrant)
    void remoteUpsert('intrants', intrant as unknown as Record<string, unknown>)
    return intrant
  },

  async update(id: string, data: Partial<IntrantFormData>): Promise<void> {
    await db.intrants.update(id, { ...data, updatedAt: now() })
    const full = await db.intrants.get(id)
    if (full) void remoteUpsert('intrants', full as unknown as Record<string, unknown>)
  },

  async delete(id: string): Promise<void> {
    await db.intrants.delete(id)
    void remoteDelete('intrants', id)
  },
}
