/**
 * A single-hue tint→shade ramp between the app's own two brand colors
 * (pink-light and burgundy) — used by the Personal Area's charts so their
 * colors are always drawn from the existing palette (no new hues), per the
 * "no new unrelated colors" brief. Two uses:
 *  - `rampStep(i, n)` — a fixed categorical step by array position (donut
 *    slices: color follows the category, never how big its slice is).
 *  - `rampAt(t)` — a continuous sequential color by value 0..1 (bar charts:
 *    color follows the number itself, so a higher bar reads as a deeper
 *    accent — the "one stronger maroon accent for the highest-progress
 *    category" effect falls out of the data rather than being hardcoded).
 */
const PINK_LIGHT = "#fff0f2"
const BURGUNDY = "#6f1e35"

function mixHex(from: string, to: string, t: number): string {
  const clamped = Math.max(0, Math.min(1, t))
  const a = parseInt(from.slice(1), 16)
  const b = parseInt(to.slice(1), 16)
  const ar = (a >> 16) & 255
  const ag = (a >> 8) & 255
  const ab = a & 255
  const br = (b >> 16) & 255
  const bg = (b >> 8) & 255
  const bb = b & 255
  const r = Math.round(ar + (br - ar) * clamped)
  const g = Math.round(ag + (bg - ag) * clamped)
  const bl = Math.round(ab + (bb - ab) * clamped)
  return `#${[r, g, bl].map((v) => v.toString(16).padStart(2, "0")).join("")}`
}

/** A continuous point on the pink→burgundy ramp, 0 = lightest, 1 = darkest. */
export function rampAt(t: number): string {
  return mixHex(PINK_LIGHT, BURGUNDY, t)
}

/** The i-th of n fixed, evenly-spaced steps on the same ramp — stable for a
 * given (i, n) regardless of which OTHER items are present, so a category's
 * color never shifts just because a sibling category disappeared. */
export function rampStep(index: number, count: number): string {
  if (count <= 1) return rampAt(0.55)
  return rampAt(index / (count - 1))
}
