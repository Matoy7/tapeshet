import * as React from "react"
import * as RechartsPrimitive from "recharts"
import { cn } from "@/lib/cn"

/**
 * Tafeshet Chart System — foundation layer.
 *
 * A trimmed, on-brand port of shadcn/ui's `chart` primitive: Recharts stays
 * the actual drawing engine, this just gives every chart in the app one
 * shared container (`ChartContainer`), one shared config shape
 * (`ChartConfig`, keyed the same way shadcn's is: dataKey → {label, color}),
 * and one shared tooltip look. Unlike the stock shadcn version this reads
 * the app's own `--color-tafsheet-*` tokens (no `--background`/`--border`
 * generic vars exist here) and drops the light/dark theme switch — the
 * product has no dark mode by design.
 */
export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode
    color?: string
  }
>

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

export function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("Chart components must be used within a <ChartContainer />")
  }
  return context
}

type ChartContainerProps = Omit<React.ComponentProps<"div">, "children"> & {
  id?: string
  config: ChartConfig
  children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"]
}

/** Wraps a Recharts chart in Tafeshet's shared visual language: no chart
 * component here reaches for a generic Recharts default (focus rings,
 * white stroke separators) without overriding it to match the brand. */
export function ChartContainer({ id, className, children, config, ...props }: ChartContainerProps) {
  const uniqueId = React.useId()
  const chartId = `chart-${id ?? uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        className={cn(
          "flex aspect-auto justify-center text-tafsheet-text-secondary",
          "[&_.recharts-cartesian-axis-tick_text]:fill-tafsheet-text-muted",
          "[&_.recharts-cartesian-grid_line]:stroke-tafsheet-border",
          "[&_.recharts-curve.recharts-tooltip-cursor]:stroke-tafsheet-border",
          "[&_.recharts-layer]:outline-none",
          "[&_.recharts-sector]:outline-none",
          "[&_.recharts-sector[stroke='#fff']]:stroke-transparent",
          "[&_.recharts-surface]:outline-none",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

/** Publishes each config entry's color as a `--color-{key}` CSS variable
 * scoped to this chart instance, so a `<Bar fill="var(--color-progress)" />`
 * (etc.) never hardcodes a hex value inside a chart component itself — the
 * palette lives in one place: chartTheme.ts feeds the config. */
function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const colorConfig = Object.entries(config).filter(([, cfg]) => cfg.color)
  if (!colorConfig.length) return null

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `[data-chart=${id}] { ${colorConfig.map(([key, cfg]) => `--color-${key}: ${cfg.color};`).join(" ")} }`,
      }}
    />
  )
}

export const ChartTooltip = RechartsPrimitive.Tooltip

type ChartTooltipContentProps = React.ComponentProps<typeof RechartsPrimitive.Tooltip> & {
  className?: string
  indicator?: "dot" | "line"
  hideLabel?: boolean
  hideIndicator?: boolean
}

/** A compact, on-brand replacement for Recharts' bare default tooltip: white
 * surface, thin tafsheet border, the app's own card shadow — never the
 * plain black-border box Recharts ships with. */
export function ChartTooltipContent({
  active,
  payload,
  label,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  labelFormatter,
  formatter,
}: ChartTooltipContentProps) {
  const { config } = useChart()

  if (!active || !payload?.length) return null

  return (
    <div
      className={cn(
        "grid min-w-32 gap-1.5 rounded-lg border border-tafsheet-border bg-tafsheet-surface px-2.5 py-1.5 text-[12px] leading-[16px] shadow-card",
        className,
      )}
    >
      {!hideLabel && label ? (
        <div className="font-semibold text-tafsheet-text-primary">
          {labelFormatter ? labelFormatter(label, payload) : label}
        </div>
      ) : null}
      <div className="grid gap-1">
        {payload.map((item, index) => {
          const key = String(item.dataKey ?? item.name ?? index)
          const itemConfig = config[key]
          const indicatorColor = (item.payload as { fill?: string } | undefined)?.fill ?? item.color

          return (
            <div key={item.dataKey ?? index} className="flex items-center gap-2">
              {!hideIndicator ? (
                <span
                  aria-hidden
                  className={cn("shrink-0", indicator === "dot" ? "size-2 rounded-full" : "h-2 w-2.5 rounded-[2px]")}
                  style={{ backgroundColor: indicatorColor }}
                />
              ) : null}
              <div className="flex flex-1 items-center justify-between gap-3">
                <span className="text-tafsheet-text-muted">{itemConfig?.label ?? item.name}</span>
                <span className="font-semibold text-tafsheet-text-primary">
                  {formatter
                    ? formatter(item.value as never, item.name as never, item, index, item.payload)
                    : item.value}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
