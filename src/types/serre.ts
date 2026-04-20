export interface Serre {
  id: string
  nom: string
  localisation?: string
  superficie?: number
  nombrePlants?: number
  dateCreation: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export type SerreFormData = Omit<Serre, 'id' | 'createdAt' | 'updatedAt'>
