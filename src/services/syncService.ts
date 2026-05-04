import { supabase } from '@/lib/supabase'
import { db } from '@/db/database'

type TableName = 'serres' | 'depenses' | 'actions' | 'intrants' | 'ventes' | 'prix_marche'

const TABLE_MAP: { remote: TableName; local: keyof typeof db }[] = [
  { remote: 'serres',      local: 'serres' },
  { remote: 'depenses',    local: 'depenses' },
  { remote: 'actions',     local: 'actions' },
  { remote: 'intrants',    local: 'intrants' },
  { remote: 'ventes',      local: 'ventes' },
  { remote: 'prix_marche', local: 'prixMarche' },
]

function stripUserId<T extends Record<string, unknown>>(record: T): Omit<T, 'user_id'> {
  const { user_id: _uid, ...rest } = record
  return rest as Omit<T, 'user_id'>
}

export const syncService = {
  async hasRemoteData(userId: string): Promise<boolean> {
    const { count } = await supabase
      .from('serres')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
    return (count ?? 0) > 0
  },

  async hasLocalData(): Promise<boolean> {
    const count = await db.serres.count()
    return count > 0
  },

  // Pousse toutes les données locales Dexie vers Supabase
  async pushLocalToSupabase(userId: string): Promise<void> {
    const [serres, depenses, actions, intrants, ventes, prixMarche] = await Promise.all([
      db.serres.toArray(),
      db.depenses.toArray(),
      db.actions.toArray(),
      db.intrants.toArray(),
      db.ventes.toArray(),
      db.prixMarche.toArray(),
    ])

    const batches = [
      { table: 'serres',      rows: serres.map(r => ({ ...r, user_id: userId })) },
      { table: 'depenses',    rows: depenses.map(r => ({ ...r, user_id: userId })) },
      { table: 'actions',     rows: actions.map(r => ({ ...r, user_id: userId })) },
      { table: 'intrants',    rows: intrants.map(r => ({ ...r, user_id: userId })) },
      { table: 'ventes',      rows: ventes.map(r => ({ ...r, user_id: userId })) },
      { table: 'prix_marche', rows: prixMarche.map(r => ({ ...r, user_id: userId })) },
    ]

    for (const { table, rows } of batches) {
      if (rows.length === 0) continue
      const { error } = await supabase.from(table).upsert(rows)
      if (error) console.error(`[Sync] push ${table}:`, error.message)
    }
  },

  // Tire toutes les données Supabase et les met dans Dexie
  async pullFromSupabase(userId: string): Promise<void> {
    const fetches = await Promise.all(
      TABLE_MAP.map(({ remote }) =>
        supabase.from(remote).select('*').eq('user_id', userId)
      )
    )

    await db.transaction('rw', [
      db.serres, db.depenses, db.actions,
      db.intrants, db.ventes, db.prixMarche,
    ], async () => {
      for (let i = 0; i < TABLE_MAP.length; i++) {
        const { local } = TABLE_MAP[i]
        const { data, error } = fetches[i]
        if (error) { console.error(`[Sync] pull ${TABLE_MAP[i].remote}:`, error.message); continue }
        if (!data) continue

        const table = db[local] as import('dexie').Table
        await table.clear()
        if (data.length > 0) {
          await table.bulkAdd(data.map(r => stripUserId(r as Record<string, unknown>)))
        }
      }
    })
  },

  // Supprime toutes les données locales (à la déconnexion si souhaité)
  async clearLocal(): Promise<void> {
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
    })
  },
}
