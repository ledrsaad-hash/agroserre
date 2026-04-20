import Dexie, { type Table } from 'dexie'
import type { Serre } from '@/types/serre'
import type { Depense } from '@/types/depense'
import type { Action } from '@/types/action'
import type { Intrant } from '@/types/intrant'
import type { Vente } from '@/types/vente'
import type { PrixMarche } from '@/types/marche'

export class AgroSerreDB extends Dexie {
  serres!: Table<Serre, string>
  depenses!: Table<Depense, string>
  actions!: Table<Action, string>
  intrants!: Table<Intrant, string>
  ventes!: Table<Vente, string>
  prixMarche!: Table<PrixMarche, string>

  constructor() {
    super('AgroSerreDB')

    this.version(1).stores({
      serres:     'id, nom, dateCreation, createdAt',
      depenses:   'id, date, serreId, categorie, createdAt',
      actions:    'id, date, serreId, type, createdAt',
      intrants:   'id, date, serreId, typeIntrant, nomProduit, createdAt',
      ventes:     'id, date, *serreIds, createdAt',
      prixMarche: 'id, date, createdAt',
    })
  }
}

export const db = new AgroSerreDB()
