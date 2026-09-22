import { useCallback, useEffect, useState } from "react"
import {
  fetchSavedItemIds,
  lastCommittedSavedItem,
  seedSavedItemState,
  setSavedItem,
  type SavedItemTable,
} from "@/data/savedItemSet"
import { toggleInSet } from "@/lib/toggleInSet"

type UseSavedItemSetResult = {
  items: Set<string>
  toggle: (itemId: string) => void
  loading: boolean
}

/**
 * A Set of saved/checked item ids for the signed-in user, persisted to the
 * table `spec` names (see src/data/savedItemSet.ts) — loaded once per
 * sign-in and kept in sync with an optimistic, serialised write on every
 * toggle, the same way useNames.ts does for name favorites. Backs
 * gearChecked, leavingChecked and professionalFavorites in App.tsx, so
 * "אזור אישי" and the screen the item was saved from share this exact Set.
 *
 * Signed out (no userId), this is session-only local state — there's no
 * account to persist it against yet.
 */
export function useSavedItemSet(spec: SavedItemTable, userId: string | undefined): UseSavedItemSetResult {
  const [items, setItems] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    if (!userId) {
      setItems(new Set())
      setLoading(false)
      return () => {
        active = false
      }
    }

    setLoading(true)
    fetchSavedItemIds(spec, userId)
      .then((ids) => {
        if (!active) return
        for (const id of ids) seedSavedItemState(spec, id, true)
        setItems(ids)
      })
      .catch((err) => {
        // Best-effort, same as fetchFavorites in useNames: if this fails
        // (e.g. the table isn't migrated yet on this database) the rest of
        // the app should keep working, just with nothing pre-checked.
        console.error(`failed to load ${spec.table}`, err)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
    // spec is a fresh object per call site but stable in shape/identity for
    // the lifetime of that call site (each hook call always passes the same
    // literal), so it's intentionally left out of the deps list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const toggle = useCallback(
    (itemId: string) => {
      if (!userId) {
        setItems((prev) => toggleInSet(prev, itemId))
        return
      }

      const wasSaved = items.has(itemId)
      const nextSaved = !wasSaved

      setItems((prev) => toggleInSet(prev, itemId))

      setSavedItem(spec, itemId, userId, nextSaved).catch(() => {
        const committed = lastCommittedSavedItem(spec, itemId) ?? wasSaved
        setItems((prev) => {
          const has = prev.has(itemId)
          if (has === committed) return prev
          return toggleInSet(prev, itemId)
        })
      })
    },
    [userId, items, spec],
  )

  return { items, toggle, loading }
}
