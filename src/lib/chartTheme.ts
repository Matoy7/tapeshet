import { rampAt, rampStep } from "@/lib/colorRamp"

/**
 * Tafeshet Chart System — shared design tokens.
 *
 * The one place every chart in the product reads its non-color visual
 * decisions from (grid, ticks, typography), so a future third chart looks
 * like a sibling of these two rather than a fresh design. Colors themselves
 * stay in colorRamp.ts (the brand pink→burgundy ramp) and are re-exported
 * here so a chart file only ever imports from `chartTheme`.
 */
export { rampAt, rampStep }

/** Hairline grid/axis strokes — same token as card borders elsewhere
 * (`--color-tafsheet-border`), so a chart's grid reads as "part of this
 * card", never as a heavier, separately-designed element. */
export const CHART_GRID_STROKE = "#f0e8e0"

/** Axis tick / secondary label color — `--color-tafsheet-text-muted`. */
export const CHART_TICK_COLOR = "#877275"

/** Primary on-chart label color (in-slice %, bar % labels) when sitting on
 * a light fill — `--color-tafsheet-text-primary`. */
export const CHART_LABEL_COLOR = "#1d1b19"

/** In-slice / on-fill % labels need to flip between the app's dark text
 * color and white depending on how light or dark the fill under them is —
 * a label is never assumed white just because it's "on the ramp", since a
 * ramp position near the pink-light end genuinely can't hold white text
 * legibly. Standard sRGB relative-luminance check: a fill lighter than the
 * threshold gets the dark text color, a darker fill gets white. */
function relativeLuminance(hex: string): number {
  const normalized = hex.replace("#", "")
  const value = normalized.length === 3
    ? normalized.split("").map((c) => c + c).join("")
    : normalized
  const r = parseInt(value.slice(0, 2), 16) / 255
  const g = parseInt(value.slice(2, 4), 16) / 255
  const b = parseInt(value.slice(4, 6), 16) / 255
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function getOnFillLabelColor(fill: string): string {
  return relativeLuminance(fill) > 0.6 ? CHART_LABEL_COLOR : "#ffffff"
}

export const CHART_FONT_FAMILY = "var(--font-sans)"

/** Shared tick typography, spread directly onto a Recharts `<XAxis tick={{...}} />`.
 * 16px — the page's own text-size floor — kept visually subtle through
 * muted color and weight (see individual chart usage) rather than through
 * being too small to read. */
export const CHART_TICK_STYLE = {
  fill: CHART_TICK_COLOR,
  fontSize: 16,
  fontFamily: CHART_FONT_FAMILY,
  fontWeight: 500,
} as const

/** A slice/bar earns an inline % label only once it's visually big enough
 * to hold one legibly — smaller values still surface their % via the
 * legend or the label already printed above/below them. */
export const CHART_MIN_LABEL_PERCENT = 8
