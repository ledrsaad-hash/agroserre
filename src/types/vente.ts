export type TypeAffectationVente = 'mono_serre' | 'multi_serres'

export interface ChargesFixesVente {
  travailleur?: number
  courtier?: number
  transport?: number
  autre?: number
}

export interface VenteSerreRepartition {
  serreId: string
  nombreRegimes: number
  tonnageBrut?: number
}

export interface Vente {
  id: string
  date: string
  typeAffectation: TypeAffectationVente
  serreIds: string[]
  repartitions: VenteSerreRepartition[]
  nombreRegimesTotal: number
  tonnageBrutTotal: number
  prixAuKg: number
  pourcentageCharges: number
  chargesFixes?: ChargesFixesVente
  acheteur?: string
  lieuVente?: string
  note?: string
  createdAt: string
  updatedAt: string
}

export type VenteFormData = Omit<Vente, 'id' | 'createdAt' | 'updatedAt'>

export interface VenteCalculee {
  tonnageBrut: number
  tonnageNet: number
  totalBrut: number
  totalNet: number
  chargesVariables: number
  chargesFixesTotal: number
  coutVenteTotal: number
  revenusNetFinal: number
  poidsMoyenParRegime: number
  poidsMoyenNetParRegime: number
}
