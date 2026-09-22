/**
 * Maps the mobile app's screens to real URLs and back.
 *
 * Kept as a plain lookup (not a `<Routes>` tree) on purpose: every screen
 * stays mounted at all times (see App.tsx) so its own state — a checked
 * checklist item, an expanded accordion category — survives navigating away
 * and back, exactly like the desktop "browse" section already did before
 * this existed. `<Routes>` would unmount the non-matching screen on every
 * navigation and reset that state, which is the opposite of what "the
 * category is restored correctly" (after Back) requires.
 */
// "הכנת תיק לידה" (Hospital Bag) is no longer its own screen — it merged
// into "ציוד לתינוק" (Baby Gear) as one of that screen's categories (see
// BabyGearScreen.tsx), so "bag" is no longer a MobileView of its own.
//
// "personal" ("אזור אישי") is a desktop-only screen — reachable only via the
// desktop sidebar's nav item (see App.tsx's NAV_GROUPS); the mobile drawer's
// own category list has no entry that points here, so mobile never
// navigates into it through the UI. It still gets a real route so the
// desktop sidebar can use ordinary navigation like every other nav item.
export type MobileView = "home" | "browse" | "gear" | "leaving" | "professionals" | "personal"

export const ROUTE_FOR_VIEW: Record<MobileView, string> = {
  home: "/",
  browse: "/name-selection",
  gear: "/baby-equipment",
  leaving: "/before-going-out",
  professionals: "/professionals",
  personal: "/personal-area",
}

const VIEW_FOR_ROUTE: Record<string, MobileView> = Object.fromEntries(
  (Object.entries(ROUTE_FOR_VIEW) as [MobileView, string][]).map(([view, route]) => [route, view]),
)

/**
 * The old Hospital Bag screen's own URL. Kept mapped (rather than left to
 * fall through to Home) so a bookmark, a shared link, or browser history
 * pointing at the pre-merge screen still lands somewhere meaningful — the
 * merged "ציוד לתינוק" screen, whose own top category is now "הכנת תיק
 * לידה" (see BabyGearScreen.tsx's defaultOpen on that category).
 */
const LEGACY_ROUTES: Record<string, MobileView> = {
  "/hospital-bag": "gear",
}

/** Unrecognised paths (or the router's basename root before it resolves) fall back to Home. */
export function viewForPathname(pathname: string): MobileView {
  return VIEW_FOR_ROUTE[pathname] ?? LEGACY_ROUTES[pathname] ?? "home"
}
