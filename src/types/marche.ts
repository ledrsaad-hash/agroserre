export interface PrixMarche {
  id: string
  date: string
  prixKg: number
  marche?: string
  ville?: string
  note?: string
  createdAt: string
}

export type PrixMarcheFormData = Omit<PrixMarche, 'id' | 'createdAt'>
