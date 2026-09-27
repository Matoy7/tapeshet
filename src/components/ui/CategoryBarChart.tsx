import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { CHART_GRID_STROKE, CHART_LABEL_COLOR, CHART_TICK_STYLE } from "@/lib/chartTheme"

export type CategoryBar = {
  id: string
  label: string
  percent: number
  color: string
}

const CHART_HEIGHT = 200

/** Wraps a category label onto up to two lines under its bar (the same
 * two-line allowance the old line-clamp gave it), since Recharts' own tick
 * text has no CSS line-clamp equivalent. */
function CategoryTick({ x, y, payload }: { x: number; y: number; payload: { value: string } }) {
  const words = payload.value.split(" ")
  const lines: string[] = []
  let current = ""
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (candidate.length > 12 && current) {
      lines.push(current)
      current = word
    } else {
      current = candidate
    }
  }
  if (current) lines.push(current)
  const shown = lines.slice(0, 2)

  return (
    <text x={x} y={y} textAnchor="middle" style={CHART_TICK_STYLE}>
      {shown.map((line, index) => (
        <tspan key={line} x={x} dy={index === 0 ? 14 : 14}>
          {line}
        </tspan>
      ))}
    </text>
  )
}

/**
 * A minimal vertical bar chart — percent-complete per category. Built on
 * the Tafeshet Chart System's shared `ChartContainer` (Recharts
 * underneath): rounded bar tops, the percentage printed above each bar,
 * category name below it, a subtle horizontal grid and a light Y-axis
 * scale rather than the app's own hand-rolled SVG bars. Categories read
 * right-to-left (first category rightmost) to match the rest of the RTL
 * page.
 */
export function CategoryBarChart({ bars }: { bars: CategoryBar[] }) {
  const config: ChartConfig = Object.fromEntries(
    bars.map((bar) => [bar.id, { label: bar.label, color: bar.color }]),
  )

  return (
    <ChartContainer config={config} style={{ width: "100%", height: CHART_HEIGHT }}>
      <BarChart data={bars} margin={{ top: 20, right: 4, left: 4, bottom: 4 }}>
        <CartesianGrid vertical={false} stroke={CHART_GRID_STROKE} strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          reversed
          tickLine={false}
          axisLine={false}
          interval={0}
          tick={(props) => <CategoryTick {...props} />}
        />
        <YAxis
          domain={[0, 100]}
          tickCount={3}
          tickLine={false}
          axisLine={false}
          width={28}
          tick={CHART_TICK_STYLE}
          tickFormatter={(value: number) => `${value}%`}
        />
        <ChartTooltip
          cursor={{ fill: CHART_GRID_STROKE, radius: 8 }}
          content={<ChartTooltipContent formatter={(value) => `${value}%`} />}
        />
        <Bar dataKey="percent" radius={[8, 8, 0, 0]} maxBarSize={34} isAnimationActive={false}>
          <LabelList
            dataKey="percent"
            position="top"
            formatter={(value: number) => `${value}%`}
            style={{ fill: CHART_LABEL_COLOR, fontSize: 12, fontWeight: 700, fontFamily: "var(--font-sans)" }}
          />
          {bars.map((bar) => (
            <Cell key={bar.id} fill={bar.color} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
