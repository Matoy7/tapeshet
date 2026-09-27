import { Cell, Pie, PieChart } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { CHART_GRID_STROKE, CHART_MIN_LABEL_PERCENT, getOnFillLabelColor } from "@/lib/chartTheme"

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
const INNER_RADIUS = 49
const OUTER_RADIUS = 75
/** Small visual gap between adjacent slices (mark-spec: a surface gap
 * between fills), in degrees. */
const GAP_DEGREES = 3
/** Rounds each slice's arc corners — the "thick, rounded-looking donut"
 * the Tafeshet Chart System calls for, instead of a flat pie-chart edge. */
const CORNER_RADIUS = 6

type SliceLabelProps = {
  cx: number
  cy: number
  midAngle: number
  innerRadius: number
  outerRadius: number
  percent: number
  index: number
  payload: DonutSegment
}

/** A % label centered on a slice's own arc — only for slices large enough
 * to hold one legibly; smaller slices are still identified via the legend
 * (color is never the only way to tell slices apart). Text color follows
 * the slice's own fill (light fills get dark text, dark fills get white)
 * rather than assuming every slice is dark enough for white. */
function renderSliceLabel(props: SliceLabelProps) {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, index, payload } = props
  const roundedPercent = Math.round(percent * 100)
  if (roundedPercent < CHART_MIN_LABEL_PERCENT) return null

  const radius = (innerRadius + outerRadius) / 2
  const radians = (-midAngle * Math.PI) / 180
  const x = cx + radius * Math.cos(radians)
  const y = cy + radius * Math.sin(radians)

  return (
    <text
      key={`slice-label-${index}`}
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize={12}
      fontWeight={700}
      fill={getOnFillLabelColor(payload.color)}
    >
      {roundedPercent}%
    </text>
  )
}

/**
 * A donut chart: composition of a whole by category. Built on the Tafeshet
 * Chart System's shared `ChartContainer` (Recharts underneath), styled to
 * the brand's own pink→burgundy ramp — never a generic charting-library
 * look. Built for RTL: a legend renders as this component's first child, so
 * in an RTL flex row it lands on the right per the brief, with the ring
 * itself to its left.
 */
export function DonutChart({ segments, total, centerCaption }: DonutChartProps) {
  const config: ChartConfig = Object.fromEntries(
    segments.map((segment) => [segment.id, { label: segment.label, color: segment.color }]),
  )

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
              <span className="truncate text-[13px] font-semibold leading-[18px] text-tafsheet-text-primary">
                {segment.label}
              </span>
              <span className="text-[12px] leading-4 text-tafsheet-text-muted">{segment.count} פריטים</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
        <ChartContainer config={config} className="aspect-square" style={{ width: SIZE, height: SIZE }}>
          <PieChart>
            {/* Background track: peeks through the small gaps between
                slices, same as a continuous ring would — without it the
                gaps would just show blank card background. */}
            <Pie
              data={[{ id: "track", value: 1 }]}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={INNER_RADIUS}
              outerRadius={OUTER_RADIUS}
              startAngle={90}
              endAngle={450}
              isAnimationActive={false}
              stroke="none"
              fill={CHART_GRID_STROKE}
            />
            <Pie
              data={segments}
              dataKey="count"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={INNER_RADIUS}
              outerRadius={OUTER_RADIUS}
              startAngle={90}
              endAngle={450}
              paddingAngle={segments.length > 1 ? GAP_DEGREES : 0}
              cornerRadius={CORNER_RADIUS}
              stroke="none"
              label={renderSliceLabel}
              labelLine={false}
              isAnimationActive={false}
            >
              {segments.map((segment) => (
                <Cell key={segment.id} fill={segment.color} />
              ))}
            </Pie>
            <ChartTooltip
              content={<ChartTooltipContent hideLabel formatter={(value) => `${value} פריטים`} />}
            />
          </PieChart>
        </ChartContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[26px] font-extrabold leading-7 text-tafsheet-text-primary">{total}</span>
          <span className="mt-0.5 max-w-[80px] text-center text-[11px] leading-[14px] text-tafsheet-text-muted">
            {centerCaption}
          </span>
        </div>
      </div>
    </div>
  )
}
