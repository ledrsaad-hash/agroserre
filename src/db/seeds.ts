import { db } from './database'
import { nanoid } from './nanoid'
import { format, subDays, subMonths } from 'date-fns'

const today = new Date()
const fmt = (d: Date) => format(d, 'yyyy-MM-dd')
const now = () => new Date().toISOString()

export async function seedDemoData() {
  const count = await db.serres.count()
  if (count > 0) return

  const s1 = nanoid()
  const s2 = nanoid()

  await db.serres.bulkAdd([
    {
      id: s1,
      nom: 'Serre Principale',
      localisation: 'Secteur A',
      superficie: 2000,
      nombrePlants: 450,
      dateCreation: fmt(subMonths(today, 6)),
      notes: 'Serre banane variété Cavendish',
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: s2,
      nom: 'Serre Nord',
      localisation: 'Secteur B',
      superficie: 1200,
      nombrePlants: 280,
      dateCreation: fmt(subMonths(today, 3)),
      notes: 'Nouvelle serre, première récolte prévue',
      createdAt: now(),
      updatedAt: now(),
    },
  ])

  await db.depenses.bulkAdd([
    { id: nanoid(), date: fmt(subDays(today, 45)), serreId: s1, categorie: 'engrais', description: 'Engrais NPK 15-15-15', montant: 2800, devise: 'MAD', createdAt: now(), updatedAt: now() },
    { id: nanoid(), date: fmt(subDays(today, 30)), serreId: s1, categorie: 'irrigation', description: 'Réparation système goutte-à-goutte', montant: 1500, devise: 'MAD', createdAt: now(), updatedAt: now() },
    { id: nanoid(), date: fmt(subDays(today, 20)), serreId: s1, categorie: 'main_doeuvre', description: 'Main d\'œuvre mensuelle', montant: 4000, devise: 'MAD', createdAt: now(), updatedAt: now() },
    { id: nanoid(), date: fmt(subDays(today, 15)), serreId: s2, categorie: 'engrais', description: 'Engrais foliaire', montant: 1200, devise: 'MAD', createdAt: now(), updatedAt: now() },
    { id: nanoid(), date: fmt(subDays(today, 10)), serreId: null, categorie: 'entretien', description: 'Entretien général exploitation', montant: 800, devise: 'MAD', createdAt: now(), updatedAt: now() },
    { id: nanoid(), date: fmt(subDays(today, 5)), serreId: s2, categorie: 'traitement', description: 'Traitement fongique', montant: 650, devise: 'MAD', createdAt: now(), updatedAt: now() },
  ])

  await db.actions.bulkAdd([
    { id: nanoid(), date: fmt(subDays(today, 40)), serreId: s1, type: 'fertilisation', description: 'Fertilisation NPK + oligoéléments', createdAt: now(), updatedAt: now() },
    { id: nanoid(), date: fmt(subDays(today, 25)), serreId: s1, type: 'traitement', description: 'Traitement préventif cercosporiose', coutAssocie: 320, createdAt: now(), updatedAt: now() },
    { id: nanoid(), date: fmt(subDays(today, 12)), serreId: s2, type: 'entretien', description: 'Taille et nettoyage serre', createdAt: now(), updatedAt: now() },
    { id: nanoid(), date: fmt(subDays(today, 3)), serreId: s1, type: 'recolte', description: 'Récolte partielle régimes mûrs', createdAt: now(), updatedAt: now() },
  ])

  await db.intrants.bulkAdd([
    { id: nanoid(), date: fmt(subDays(today, 45)), serreId: s1, typeIntrant: 'engrais', nomProduit: 'NPK 15-15-15', quantite: 50, unite: 'kg', cout: 2800, createdAt: now(), updatedAt: now() },
    { id: nanoid(), date: fmt(subDays(today, 30)), serreId: s1, typeIntrant: 'pesticide', nomProduit: 'Karate Zeon', quantite: 2, unite: 'L', cout: 480, createdAt: now(), updatedAt: now() },
    { id: nanoid(), date: fmt(subDays(today, 15)), serreId: s2, typeIntrant: 'engrais', nomProduit: 'Engrais foliaire Poly-Feed', quantite: 10, unite: 'kg', cout: 1200, createdAt: now(), updatedAt: now() },
  ])

  const v1 = nanoid()
  await db.ventes.bulkAdd([
    {
      id: v1,
      date: fmt(subDays(today, 7)),
      typeAffectation: 'mono_serre',
      serreIds: [s1],
      repartitions: [{ serreId: s1, nombreRegimes: 85 }],
      nombreRegimesTotal: 85,
      tonnageBrutTotal: 1870,
      prixAuKg: 4.5,
      pourcentageCharges: 4,
      chargesFixes: { travailleur: 200, courtier: 150, transport: 300 },
      acheteur: 'Souk Inzegane',
      lieuVente: 'Inzegane',
      createdAt: now(),
      updatedAt: now(),
    },
  ])

  await db.prixMarche.bulkAdd([
    { id: nanoid(), date: fmt(subDays(today, 7)), prixKg: 4.5, marche: 'Souk Inzegane', createdAt: now() },
    { id: nanoid(), date: fmt(subDays(today, 3)), prixKg: 4.8, marche: 'Souk Tiznit', createdAt: now() },
    { id: nanoid(), date: fmt(today), prixKg: 5.0, marche: 'Marché Agadir', createdAt: now() },
  ])
}
