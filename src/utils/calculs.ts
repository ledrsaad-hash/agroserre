import type { Vente, VenteCalculee } from '@/types/vente'
import type { Depense } from '@/types/depense'
import type { IndicateursSerre, IndicateursGlobaux } from '@/types/indicateurs'
import type { Action } from '@/types/action'
import type { Serre } from '@/types/serre'

export function calculerVente(vente: Vente): VenteCalculee {
  const { tonnageBrutTotal, prixAuKg, pourcentageCharges, chargesFixes, nombreRegimesTotal } = vente

  const tonnageNet = tonnageBrutTotal * (1 - pourcentageCharges / 100)
  const totalBrut = tonnageBrutTotal * prixAuKg
  const totalNet = tonnageNet * prixAuKg
  const chargesVariables = totalBrut - totalNet

  const chargesFixesTotal =
    (chargesFixes?.travailleur ?? 0) +
    (chargesFixes?.courtier ?? 0) +
    (chargesFixes?.transport ?? 0) +
    (chargesFixes?.autre ?? 0)

  const coutVenteTotal = chargesVariables + chargesFixesTotal

  const poidsMoyenParRegime = nombreRegimesTotal > 0 ? tonnageBrutTotal / nombreRegimesTotal : 0
  const poidsMoyenNetParRegime = nombreRegimesTotal > 0 ? tonnageNet / nombreRegimesTotal : 0

  return {
    tonnageBrut: tonnageBrutTotal,
    tonnageNet,
    totalBrut,
    totalNet,
    chargesVariables,
    chargesFixesTotal,
    coutVenteTotal,
    revenusNetFinal: totalNet - chargesFixesTotal,
    poidsMoyenParRegime,
    poidsMoyenNetParRegime,
  }
}

export function calculerROI(ventes: number, depenses: number): number | null {
  if (depenses === 0) return null
  return ((ventes - depenses) / depenses) * 100
}

export function calculerIndicateursSerre(
  serre: Serre,
  depenses: Depense[],
  actions: Action[],
  ventes: Vente[]
): IndicateursSerre {
  const serreDepenses = depenses.filter(d => d.serreId === serre.id)
  const totalDepenses = serreDepenses.reduce((s, d) => s + d.montant, 0)

  const serreVentes = ventes.filter(v => v.serreIds.includes(serre.id))

  let totalVentesNettes = 0
  let totalRegimes = 0
  let tonnageBrutTotal = 0
  let tonnageNetTotal = 0

  for (const vente of serreVentes) {
    const calc = calculerVente(vente)
    if (vente.typeAffectation === 'mono_serre') {
      totalVentesNettes += calc.totalNet - calc.chargesFixesTotal
      totalRegimes += vente.nombreRegimesTotal
      tonnageBrutTotal += vente.tonnageBrutTotal
      tonnageNetTotal += calc.tonnageNet
    } else {
      const rep = vente.repartitions.find(r => r.serreId === serre.id)
      if (rep) {
        const ratio = vente.nombreRegimesTotal > 0 ? rep.nombreRegimes / vente.nombreRegimesTotal : 0
        const poidsMoyen = vente.nombreRegimesTotal > 0 ? vente.tonnageBrutTotal / vente.nombreRegimesTotal : 0
        const tonnageSerre = rep.nombreRegimes * poidsMoyen
        const tonnageNetSerre = tonnageSerre * (1 - vente.pourcentageCharges / 100)
        totalVentesNettes += tonnageNetSerre * vente.prixAuKg - (calc.chargesFixesTotal * ratio)
        totalRegimes += rep.nombreRegimes
        tonnageBrutTotal += tonnageSerre
        tonnageNetTotal += tonnageNetSerre
      }
    }
  }

  const balance = totalVentesNettes - totalDepenses
  const roi = calculerROI(totalVentesNettes, totalDepenses)
  const poidsMoyenRegime = totalRegimes > 0 ? tonnageBrutTotal / totalRegimes : 0

  return {
    serreId: serre.id,
    nomSerre: serre.nom,
    totalDepenses,
    totalVentesNettes,
    balance,
    roi,
    nombreActions: actions.filter(a => a.serreId === serre.id).length,
    totalRegimes,
    tonnageBrutTotal,
    tonnageNetTotal,
    poidsMoyenRegime,
  }
}

export function calculerIndicateursGlobaux(
  serres: Serre[],
  depenses: Depense[],
  actions: Action[],
  ventes: Vente[]
): IndicateursGlobaux {
  const parSerre = serres.map(s => calculerIndicateursSerre(s, depenses, actions, ventes))

  const totalDepenses = depenses.reduce((s, d) => s + d.montant, 0)
  const totalVentesNettes = parSerre.reduce((s, i) => s + i.totalVentesNettes, 0)
  const balance = totalVentesNettes - totalDepenses
  const roi = calculerROI(totalVentesNettes, totalDepenses)

  const parCategorie: IndicateursGlobaux['parCategorie'] = {}
  for (const d of depenses) {
    parCategorie[d.categorie] = (parCategorie[d.categorie] ?? 0) + d.montant
  }

  const tonnageBrutTotal = parSerre.reduce((s, i) => s + i.tonnageBrutTotal, 0)
  const tonnageNetTotal  = parSerre.reduce((s, i) => s + i.tonnageNetTotal, 0)
  const totalRegimes     = parSerre.reduce((s, i) => s + i.totalRegimes, 0)
  const poidsMoyenGlobal = totalRegimes > 0 ? tonnageBrutTotal / totalRegimes : 0

  return {
    totalDepenses,
    totalVentesNettes,
    balance,
    roi,
    parCategorie,
    parSerre,
    nombreSerres: serres.length,
    tonnageBrutTotal,
    tonnageNetTotal,
    totalRegimes,
    poidsMoyenGlobal,
  }
}
