import type { CategorieDepense } from './depense'

export interface IndicateursSerre {
  serreId: string
  nomSerre: string
  totalDepenses: number
  totalVentesNettes: number
  balance: number
  roi: number | null
  nombreActions: number
  totalRegimes: number
  tonnageBrutTotal: number
  tonnageNetTotal: number
  poidsMoyenRegime: number
}

export interface IndicateursGlobaux {
  totalDepenses: number
  totalVentesNettes: number
  balance: number
  roi: number | null
  parCategorie: Partial<Record<CategorieDepense, number>>
  parSerre: IndicateursSerre[]
  nombreSerres: number
  tonnageBrutTotal: number
  tonnageNetTotal: number
  totalRegimes: number
  poidsMoyenGlobal: number
}
