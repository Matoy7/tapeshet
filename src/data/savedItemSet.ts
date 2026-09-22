import { supabase } from "@/lib/supabase"

/** Postgres unique-violation: already saved. */
const UNIQUE_VIOLATION = "23505"

/**
 * A generic "which of these item ids has the signed-in user personally
 * saved/checked" store, backed by a one-row-per-(user,item) table — the
 * exact shape `name_favorites`/`src/data/favorites.ts` uses for names,
 * generalised so the same code can back the gear checklist, the leaving
 * checklist and professional favorites without three near-identical
 * copies. Each of those has its own table (see
 * supabase/2026-09-shem-tov-phase20-checklist-favorites.sql) since the
 * items themselves aren't rows in the database — only the table name and
 * its item-id column differ per collection.
 *
 * Scoped to just the signed-in user — no family, no shared/group state.
 */
export type SavedItemTable = {
  table: "gear_checklist" | "leaving_checklist" | "professional_favorites"
  itemColumn: "item_id" | "professional_id"
}

export async function fetchSavedItemIds(spec: SavedItemTable, userId: string | null): Promise<Set<string>> {
  if (!userId) return new Set()

  const { data, error } = await supabase.from(spec.table).select(spec.itemColumn).eq("user_id", userId)

  if (error) throw error

  return new Set((data ?? []).map((row) => (row as Record<string, string>)[spec.itemColumn]))
}

async function insertItem(spec: SavedItemTable, itemId: string, userId: string): Promise<void> {
  const { error } = await supabase.from(spec.table).insert({ [spec.itemColumn]: itemId, user_id: userId })
  if (error && error.code !== UNIQUE_VIOLATION) throw error
}

async function deleteItem(spec: SavedItemTable, itemId: string, userId: string): Promise<void> {
  const { error } = await supabase.from(spec.table).delete().eq(spec.itemColumn, itemId).eq("user_id", userId)
  if (error) throw error
}

// ---------------------------------------------------------------------------
// Serialised writes, keyed by `${table}:${itemId}`, so a rapid double-click
// can never race itself into the wrong end state — same pattern
// src/data/favorites.ts uses for name favorites.
// ---------------------------------------------------------------------------

const queues = new Map<string, Promise<unknown>>()
const desired = new Map<string, boolean>()
const committed = new Map<string, boolean>()

function queueKey(spec: SavedItemTable, itemId: string): string {
  return `${spec.table}:${itemId}`
}

export function seedSavedItemState(spec: SavedItemTable, itemId: string, saved: boolean): void {
  const key = queueKey(spec, itemId)
  if (!queues.has(key)) committed.set(key, saved)
}

export function setSavedItem(spec: SavedItemTable, itemId: string, userId: string, saved: boolean): Promise<void> {
  const key = queueKey(spec, itemId)
  desired.set(key, saved)

  const run = async (): Promise<void> => {
    const want = desired.get(key)
    if (want === undefined || want === committed.get(key)) return

    if (want) await insertItem(spec, itemId, userId)
    else await deleteItem(spec, itemId, userId)

    committed.set(key, want)
  }

  const previous = queues.get(key) ?? Promise.resolve()
  const next = previous.then(run, run)
  queues.set(
    key,
    next.catch(() => {}),
  )
  return next
}

export function lastCommittedSavedItem(spec: SavedItemTable, itemId: string): boolean | undefined {
  return committed.get(queueKey(spec, itemId))
}
