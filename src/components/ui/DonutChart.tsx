import { Cell, Pie, PieChart } from "recharts"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import {
  CHART_GRID_STROKE,
  CHART_LIGHT_FILL_EDGE,
  getOnFillLabelColor,
  isNearWhiteFill,
} from "@/lib/chartTheme"

export type DonutSegment = {
  id: string
  label: string
  count: number
  color: string
}

type DonutChartProps = {
  segments: DonutSegment[]
}

// ~14% larger overall, ~23% thicker ring than the first pass — the donut
// is meant to read as the card's main visual element, not sit small in the
// middle of otherwise-empty space.
const SIZE = 192
const INNER_RADIUS = 56
const OUTER_RADIUS = 88
/** Small visual gap between adjacent slices (mark-spec: a surface gap
 * between fills), in degrees. */
const GAP_DEGREES = 3
/** Rounds each slice's arc corners — the "thick, rounded-looking donut"
 * the Tafeshet Chart System calls for, instead of a flat pie-chart edge. */
const CORNER_RADIUS = 7

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

/** The slice's item count (not a percentage — the donut shows how the
 * items are distributed across categories, not progress), centered on its
 * own arc. Every slice gets its count: the legend lists category names
 * only, so the ring is the one place a count appears. Text color follows
 * the slice's own fill (light fills get dark text, dark fills get white)
 * rather than assuming every slice is dark enough for white. */
function renderSliceLabel(props: SliceLabelProps) {
  const { cx, cy, midAngle, innerRadius, outerRadius, index, payload } = props

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
      fontSize={16}
      fontWeight={700}
      fill={getOnFillLabelColor(payload.color)}
    >
      {payload.count}
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
export function DonutChart({ segments }: DonutChartProps) {
  const config: ChartConfig = Object.fromEntries(
    segments.map((segment) => [segment.id, { label: segment.label, color: segment.color }]),
  )

  return (
    // gap-4 rather than the wider gap the first pass used — legend and ring
    // read as one connected unit instead of two separate elements.
    <div className="flex items-center justify-center gap-4">
      <ul className="flex min-w-0 flex-col gap-2.5">
        {segments.map((segment) => (
          <li key={segment.id} className="flex min-w-0 items-center gap-2.5">
            {/* A thin white ring around each dot separates it from its own
                fill's neighbors and reads as a deliberate, finished mark
                rather than a flat color swatch. */}
            <span
              aria-hidden
              className="size-3 shrink-0 rounded-full ring-2 ring-white"
              style={{
                backgroundColor: segment.color,
                // Near-white swatches get the same hairline edge as their
                // slice, so the legend dot doesn't vanish either.
                boxShadow: isNearWhiteFill(segment.color)
                  ? `inset 0 0 0 1px ${CHART_LIGHT_FILL_EDGE}`
                  : "0 0 0 1px rgba(29,27,25,0.06)",
              }}
            />
            {/* Category name only — the count lives on the slice itself. No
                truncate: a category name wraps rather than being cut off. */}
            <span className="min-w-0 text-[16px] font-semibold leading-5 text-tafsheet-text-primary">
              {segment.label}
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
              {/* A near-white slice (the pink-light end of the ramp) would
                  melt into the white card — it gets a 1px dusty-pink
                  hairline edge; every other slice stays edge-less. */}
              {segments.map((segment) =>
                isNearWhiteFill(segment.color) ? (
                  <Cell key={segment.id} fill={segment.color} stroke={CHART_LIGHT_FILL_EDGE} strokeWidth={1} />
                ) : (
                  <Cell key={segment.id} fill={segment.color} />
                ),
              )}
            </Pie>
          </PieChart>
        </ChartContainer>
      </div>
    </div>
  )
}
