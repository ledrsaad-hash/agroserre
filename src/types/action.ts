export type TypeAction =
  | 'fertilisation'
  | 'traitement'
  | 'entretien'
  | 'irrigation_speciale'
  | 'recolte'
  | 'autre'

export interface Action {
  id: string
  date: string
  serreId: string
  type: TypeAction
  description: string
  coutAssocie?: number
  note?: string
  createdAt: string
  updatedAt: string
}

export type ActionFormData = Omit<Action, 'id' | 'createdAt' | 'updatedAt'>
