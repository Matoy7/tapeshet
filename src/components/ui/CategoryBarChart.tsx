export type CategoryBar = {
  id: string
  label: string
  percent: number
  color: string
}

/** "Very subtle neutral/pale background track" per the brief — the same
 * pale neutral already used for tags/chips elsewhere (RemovableChip,
 * ProfessionalCard's Tag), not a new color. */
const TRACK_COLOR = "#f3ede8"

/**
 * A minimal horizontal progress list — percent-complete per category, one
 * row each. Category name on the right (RTL), percentage on the left,
 * rounded track and fill, no axis or gridlines. No charting library: a
 * handful of labeled progress rows is simpler and more reliably RTL-correct
 * as plain markup than as an axis-based chart. The fill's color is set by
 * the caller (Personal Area screen keys it to the brand's pink→burgundy
 * ramp by the bar's own value), so this component itself makes no color
 * decisions of its own beyond the shared track.
 */
export function CategoryBarChart({ bars }: { bars: CategoryBar[] }) {
  return (
    <div className="flex flex-col gap-4">
      {bars.map((bar) => (
        <div key={bar.id} className="flex flex-col gap-1.5">
          <div className="flex items-start justify-between gap-3">
            <span className="text-[16px] font-semibold leading-5 text-[#1d1b19]">{bar.label}</span>
            <span className="shrink-0 text-[16px] font-bold leading-5 text-[#6f1e35]">{bar.percent}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: TRACK_COLOR }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${Math.max(bar.percent, 3)}%`, backgroundColor: bar.color }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
