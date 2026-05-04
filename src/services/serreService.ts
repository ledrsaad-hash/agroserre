import { db } from '@/db/database'
import { nanoid } from '@/db/nanoid'
import { remoteUpsert, remoteDelete } from '@/lib/remoteWriter'
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
    await db.serres.add(serre)
    remoteUpsert('serres', serre as unknown as Record<string, unknown>)
    return serre
  },

  async update(id: string, data: Partial<SerreFormData>): Promise<void> {
    const updatedAt = now()
    await db.serres.update(id, { ...data, updatedAt })
    const full = await db.serres.get(id)
    if (full) remoteUpsert('serres', full as unknown as Record<string, unknown>)
  },

  async delete(id: string): Promise<void> {
    await db.transaction('rw', [db.serres, db.depenses, db.actions, db.intrants], async () => {
      await db.serres.delete(id)
      await db.depenses.where('serreId').equals(id).delete()
      await db.actions.where('serreId').equals(id).delete()
      await db.intrants.where('serreId').equals(id).delete()
    })
    remoteDelete('serres', id)
  },
}
