/**
 * Returns a new Set with `id` toggled in/out of `prev` — the same
 * add-or-delete-a-copy logic every checklist/favorites Set in this app
 * needs, shared here instead of repeated in each `setState` updater.
 */
export function toggleInSet<T>(prev: Set<T>, id: T): Set<T> {
  const next = new Set(prev)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  return next
}
