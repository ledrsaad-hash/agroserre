import { db } from '@/db/database'
import { nanoid } from '@/db/nanoid'
import { remoteUpsert, remoteDelete } from '@/lib/remoteWriter'
import type { PrixMarche, PrixMarcheFormData } from '@/types/marche'

const now = () => new Date().toISOString()

export const marcheService = {
  async getAll(): Promise<PrixMarche[]> {
    return db.prixMarche.orderBy('date').reverse().toArray()
  },

  async getLast(): Promise<PrixMarche | undefined> {
    return db.prixMarche.orderBy('date').last()
  },

  async create(data: PrixMarcheFormData): Promise<PrixMarche> {
    const prix: PrixMarche = { ...data, id: nanoid(), createdAt: now() }
    await db.prixMarche.add(prix)
    remoteUpsert('prix_marche', prix as unknown as Record<string, unknown>)
    return prix
  },

  async delete(id: string): Promise<void> {
    await db.prixMarche.delete(id)
    remoteDelete('prix_marche', id)
  },
}
