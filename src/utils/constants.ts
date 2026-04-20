import type { CategorieDepense } from '@/types/depense'
import type { TypeAction } from '@/types/action'
import type { TypeIntrant } from '@/types/intrant'

export const CATEGORIES_DEPENSE: CategorieDepense[] = [
  'engrais', 'irrigation', 'main_doeuvre', 'traitement',
  'transport', 'materiel', 'entretien', 'autre',
]

export const TYPES_ACTION: TypeAction[] = [
  'fertilisation', 'traitement', 'entretien',
  'irrigation_speciale', 'recolte', 'autre',
]

export const TYPES_INTRANT: TypeIntrant[] = [
  'engrais', 'pesticide', 'fongicide',
  'herbicide', 'amendement', 'autre',
]

export const UNITES_INTRANT = ['kg', 'g', 'L', 'mL', 'sac', 'unite'] as const

export const MODES_PAIEMENT = ['especes', 'virement', 'cheque', 'autre'] as const

export const POURCENTAGE_CHARGES_DEFAULT = 4

export const CATEGORIE_COLORS: Record<CategorieDepense, string> = {
  engrais: '#22c55e',
  irrigation: '#3b82f6',
  main_doeuvre: '#f59e0b',
  traitement: '#ef4444',
  transport: '#8b5cf6',
  materiel: '#06b6d4',
  entretien: '#f97316',
  autre: '#6b7280',
}

export const ACTION_COLORS: Record<TypeAction, string> = {
  fertilisation: '#22c55e',
  traitement: '#ef4444',
  entretien: '#f97316',
  irrigation_speciale: '#3b82f6',
  recolte: '#eab308',
  autre: '#6b7280',
}
