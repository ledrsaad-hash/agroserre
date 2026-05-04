import { db } from '@/db/database'

const EXPORT_VERSION = '1.0'
const APP_NAME = 'AgroSerre'

export interface ExportPayload {
  version: string
  app: string
  exportedAt: string
  data: {
    serres: unknown[]
    depenses: unknown[]
    actions: unknown[]
    intrants: unknown[]
    ventes: unknown[]
    prixMarche: unknown[]
  }
}

export const exportService = {
  async exportAll(): Promise<void> {
    const [serres, depenses, actions, intrants, ventes, prixMarche] = await Promise.all([
      db.serres.toArray(),
      db.depenses.toArray(),
      db.actions.toArray(),
      db.intrants.toArray(),
      db.ventes.toArray(),
      db.prixMarche.toArray(),
    ])

    const payload: ExportPayload = {
      version: EXPORT_VERSION,
      app: APP_NAME,
      exportedAt: new Date().toISOString(),
      data: { serres, depenses, actions, intrants, ventes, prixMarche },
    }

    const json = JSON.stringify(payload, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const date = new Date().toISOString().slice(0, 10)
    const a = document.createElement('a')
    a.href = url
    a.download = `agroserre-backup-${date}.json`
    a.click()

    URL.revokeObjectURL(url)
  },

  async importFile(file: File, mode: 'replace' | 'merge'): Promise<ImportResult> {
    const text = await file.text()
    let payload: ExportPayload

    try {
      payload = JSON.parse(text) as ExportPayload
    } catch {
      return { success: false, error: 'invalid_json' }
    }

    if (payload.app !== APP_NAME || !payload.data) {
      return { success: false, error: 'invalid_format' }
    }

    const { data } = payload

    try {
      if (mode === 'replace') {
        await db.transaction('rw', [
          db.serres, db.depenses, db.actions,
          db.intrants, db.ventes, db.prixMarche,
        ], async () => {
          await db.serres.clear()
          await db.depenses.clear()
          await db.actions.clear()
          await db.intrants.clear()
          await db.ventes.clear()
          await db.prixMarche.clear()

          if (data.serres?.length)     await db.serres.bulkAdd(data.serres as never[])
          if (data.depenses?.length)   await db.depenses.bulkAdd(data.depenses as never[])
          if (data.actions?.length)    await db.actions.bulkAdd(data.actions as never[])
          if (data.intrants?.length)   await db.intrants.bulkAdd(data.intrants as never[])
          if (data.ventes?.length)     await db.ventes.bulkAdd(data.ventes as never[])
          if (data.prixMarche?.length) await db.prixMarche.bulkAdd(data.prixMarche as never[])
        })
      } else {
        await db.transaction('rw', [
          db.serres, db.depenses, db.actions,
          db.intrants, db.ventes, db.prixMarche,
        ], async () => {
          if (data.serres?.length)     await db.serres.bulkPut(data.serres as never[])
          if (data.depenses?.length)   await db.depenses.bulkPut(data.depenses as never[])
          if (data.actions?.length)    await db.actions.bulkPut(data.actions as never[])
          if (data.intrants?.length)   await db.intrants.bulkPut(data.intrants as never[])
          if (data.ventes?.length)     await db.ventes.bulkPut(data.ventes as never[])
          if (data.prixMarche?.length) await db.prixMarche.bulkPut(data.prixMarche as never[])
        })
      }

      return {
        success: true,
        counts: {
          serres:     data.serres?.length ?? 0,
          depenses:   data.depenses?.length ?? 0,
          actions:    data.actions?.length ?? 0,
          intrants:   data.intrants?.length ?? 0,
          ventes:     data.ventes?.length ?? 0,
          prixMarche: data.prixMarche?.length ?? 0,
        },
      }
    } catch (e) {
      return { success: false, error: 'import_failed' }
    }
  },

  async getStats(): Promise<Record<string, number>> {
    const [s, d, a, i, v, p] = await Promise.all([
      db.serres.count(),
      db.depenses.count(),
      db.actions.count(),
      db.intrants.count(),
      db.ventes.count(),
      db.prixMarche.count(),
    ])
    return { serres: s, depenses: d, actions: a, intrants: i, ventes: v, prixMarche: p }
  },
}

export interface ImportResult {
  success: boolean
  error?: 'invalid_json' | 'invalid_format' | 'import_failed'
  counts?: Record<string, number>
}
