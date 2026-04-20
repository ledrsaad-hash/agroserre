export type TypeIntrant =
  | 'engrais'
  | 'pesticide'
  | 'fongicide'
  | 'herbicide'
  | 'amendement'
  | 'autre'

export type UniteIntrant = 'kg' | 'g' | 'L' | 'mL' | 'sac' | 'unite'

export interface Intrant {
  id: string
  date: string
  serreId: string
  typeIntrant: TypeIntrant
  nomProduit: string
  quantite: number
  unite: UniteIntrant
  cout: number
  modeApplication?: string
  note?: string
  createdAt: string
  updatedAt: string
}

export type IntrantFormData = Omit<Intrant, 'id' | 'createdAt' | 'updatedAt'>
