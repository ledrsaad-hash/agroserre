import { db } from '@/db/database'
import { nanoid } from '@/db/nanoid'
import { remoteUpsert, remoteDelete } from '@/lib/remoteWriter'
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
    await db.ventes.add(vente)
    void remoteUpsert('ventes', vente as unknown as Record<string, unknown>)
    return vente
  },

  async update(id: string, data: Partial<VenteFormData>): Promise<void> {
    await db.ventes.update(id, { ...data, updatedAt: now() })
    const full = await db.ventes.get(id)
    if (full) void remoteUpsert('ventes', full as unknown as Record<string, unknown>)
  },

  async delete(id: string): Promise<void> {
    await db.ventes.delete(id)
    void remoteDelete('ventes', id)
  },
}
