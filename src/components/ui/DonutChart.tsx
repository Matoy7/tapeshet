export type DonutSegment = {
  id: string
  label: string
  count: number
  color: string
}

type DonutChartProps = {
  segments: DonutSegment[]
  total: number
  /** Shown under the big total number in the center, e.g. "פריטים בסך הכל". */
  centerCaption: string
}

const SIZE = 168
const CENTER = SIZE / 2
const RADIUS = 62
const STROKE = 26
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
/** Small visual gap between adjacent slices (mark-spec: a surface gap
 * between fills), expressed in degrees of the ring. */
const GAP_DEGREES = 3

/**
 * A donut/pie chart: composition of a whole by category, drawn as stacked
 * SVG circle strokes (no charting library — two small charts don't justify
 * one). Built for RTL: a legend renders as this component's first child, so
 * in an RTL flex row it lands on the right per the brief, with the ring
 * itself to its left. Percentage labels sit directly on any slice large
 * enough to hold one; smaller slices are still identified via the legend
 * (color is never the only way to tell slices apart).
 */
export function DonutChart({ segments, total, centerCaption }: DonutChartProps) {
  let cumulative = 0
  const arcs = segments.map((segment) => {
    const fraction = total > 0 ? segment.count / total : 0
    const gapLength = (GAP_DEGREES / 360) * CIRCUMFERENCE
    const rawLength = fraction * CIRCUMFERENCE
    const length = Math.max(rawLength - gapLength, 0)
    const offset = -(cumulative * CIRCUMFERENCE)
    const midFraction = cumulative + fraction / 2
    cumulative += fraction

    const angle = midFraction * 2 * Math.PI - Math.PI / 2
    const labelRadius = RADIUS
    const labelX = CENTER + labelRadius * Math.cos(angle)
    const labelY = CENTER + labelRadius * Math.sin(angle)
    const percent = Math.round(fraction * 100)

    return { segment, length, offset, labelX, labelY, percent }
  })

  return (
    <div className="flex items-center justify-center gap-5">
      <ul className="flex min-w-0 flex-col gap-2.5">
        {segments.map((segment) => (
          <li key={segment.id} className="flex min-w-0 items-center gap-2">
            <span
              aria-hidden
              className="mt-0.5 size-2.5 shrink-0 self-start rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-[13px] font-semibold leading-[18px] text-[#1d1b19]">
                {segment.label}
              </span>
              <span className="text-[12px] leading-4 text-[#877275]">{segment.count} פריטים</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke="#f3ede8" strokeWidth={STROKE} />
          {arcs.map(({ segment, length, offset }) => (
            <circle
              key={segment.id}
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              stroke={segment.color}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={`${length} ${CIRCUMFERENCE - length}`}
              strokeDashoffset={offset}
              transform={`rotate(-90 ${CENTER} ${CENTER})`}
            />
          ))}
          {arcs
            .filter(({ percent }) => percent >= 8)
            .map(({ segment, labelX, labelY, percent }) => (
              <text
                key={segment.id}
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={12}
                fontWeight={700}
                fill="#ffffff"
              >
                {percent}%
              </text>
            ))}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[26px] font-extrabold leading-7 text-[#1d1b19]">{total}</span>
          <span className="mt-0.5 max-w-[80px] text-center text-[11px] leading-[14px] text-[#877275]">
            {centerCaption}
          </span>
        </div>
      </div>
    </div>
  )
}
