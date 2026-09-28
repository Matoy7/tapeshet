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
          <span className="text-[16px] font-semibold leading-5 text-[#1d1b19]">{bar.label}</span>
          {/* 28px pill track; the % sits inside the fill, white, at the
              fill's leading edge (left in RTL). The fill never shrinks below
              the width its own label needs (min-w), so even a low value
              keeps its % fully inside the bar with padding on both sides. */}
          <div className="h-7 w-full overflow-hidden rounded-full" style={{ backgroundColor: TRACK_COLOR }}>
            <div
              className="flex h-full min-w-14 items-center justify-end rounded-full px-2.5"
              style={{ width: `${bar.percent}%`, backgroundColor: bar.color }}
            >
              <span className="text-[16px] font-semibold leading-none text-white">{bar.percent}%</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
