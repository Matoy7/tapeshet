export type CategoryBar = {
  id: string
  label: string
  percent: number
  color: string
}

const BAR_AREA_HEIGHT = 128

/**
 * A minimal vertical bar chart — percent-complete per category, rounded bar
 * tops, the percentage printed above each bar, category name below it, no
 * axis lines or gridlines (kept deliberately plain per the brief). No
 * charting library: a handful of bars don't justify one, and a plain flex
 * layout keeps this trivially RTL-safe (bars simply read right-to-left with
 * everything else on the page).
 */
export function CategoryBarChart({ bars }: { bars: CategoryBar[] }) {
  return (
    <div className="flex items-end justify-between gap-3">
      {bars.map((bar) => (
        <div key={bar.id} className="flex min-w-0 flex-1 flex-col items-center">
          <span className="text-[12px] font-bold leading-4 text-[#1d1b19]">{bar.percent}%</span>
          <div className="mt-1 flex w-full items-end justify-center" style={{ height: BAR_AREA_HEIGHT }}>
            <div
              className="w-full max-w-[34px] rounded-t-md"
              style={{ height: `${Math.max(bar.percent, 3)}%`, backgroundColor: bar.color }}
            />
          </div>
          <span
            className="mt-1.5 line-clamp-2 max-w-full text-center text-[11px] font-medium leading-[14px] text-[#877275]"
            title={bar.label}
          >
            {bar.label}
          </span>
        </div>
      ))}
    </div>
  )
}
