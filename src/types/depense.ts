export type CategorieDepense =
  | 'engrais'
  | 'irrigation'
  | 'main_doeuvre'
  | 'traitement'
  | 'transport'
  | 'materiel'
  | 'entretien'
  | 'autre'

export type ModePaiement = 'especes' | 'virement' | 'cheque' | 'autre'

export interface Depense {
  id: string
  date: string
  serreId: string | null
  categorie: CategorieDepense
  sousType?: string
  description: string
  montant: number
  devise: 'MAD'
  modePaiement?: ModePaiement
  note?: string
  createdAt: string
  updatedAt: string
}

export type DepenseFormData = Omit<Depense, 'id' | 'createdAt' | 'updatedAt'>
