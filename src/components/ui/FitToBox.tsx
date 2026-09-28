import { useLayoutEffect, useRef, useState, type ReactNode } from "react"
import { cn } from "@/lib/cn"

type FitToBoxProps = {
  children: ReactNode
  /** Content that fills the available width (e.g. full-width progress
   * rows): scaled by height only, and laid out at `availableWidth / scale`
   * so after scaling it still spans exactly the available width. Otherwise
   * the content keeps its own intrinsic width and is scaled to fit both
   * axes. */
  fluidWidth?: boolean
  /** Upper bound on the scale, so a very large box doesn't blow content
   * up to poster size. */
  maxScale?: number
}

/**
 * Scales its content up uniformly — like zooming an image, so every
 * internal proportion (sizes, gaps, type hierarchy) stays exactly as
 * designed — until it fills the space its parent card already has. Never
 * scales below 1, and reserves the content's natural (unscaled) height as
 * its own minimum, so the card it sits in is never smaller than before
 * and never grows because of this: the scaled content is positioned
 * absolutely and doesn't take part in the card's sizing.
 *
 * Uses `transform: scale`, not `zoom`, because offsetWidth/offsetHeight
 * always report the unscaled size under a transform in every browser,
 * which is what the fit calculation needs.
 */
export function FitToBox({ children, fluidWidth = false, maxScale = 1.75 }: FitToBoxProps) {
  const outerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [fit, setFit] = useState({ scale: 1, naturalHeight: 0, availableWidth: 0 })

  useLayoutEffect(() => {
    const outer = outerRef.current
    const inner = innerRef.current
    if (!outer || !inner) return

    const update = () => {
      const availableWidth = outer.clientWidth
      const availableHeight = outer.clientHeight
      const naturalWidth = inner.offsetWidth
      const naturalHeight = inner.offsetHeight
      if (!availableWidth || !naturalWidth || !naturalHeight) return

      const raw = fluidWidth
        ? availableHeight / naturalHeight
        : Math.min(availableWidth / naturalWidth, availableHeight / naturalHeight)
      const scale = Math.max(1, Math.min(maxScale, raw))

      setFit((prev) =>
        Math.abs(prev.scale - scale) < 0.005 &&
        Math.abs(prev.naturalHeight - naturalHeight) < 0.5 &&
        Math.abs(prev.availableWidth - availableWidth) < 0.5
          ? prev
          : { scale, naturalHeight, availableWidth },
      )
    }

    const observer = new ResizeObserver(update)
    observer.observe(outer)
    observer.observe(inner)
    update()
    return () => observer.disconnect()
  }, [fluidWidth, maxScale])

  return (
    <div ref={outerRef} className="relative min-w-0 flex-1" style={{ minHeight: fit.naturalHeight }}>
      <div
        ref={innerRef}
        className={cn("absolute left-1/2 top-1/2", !fluidWidth && "w-max")}
        style={{
          width: fluidWidth && fit.availableWidth ? fit.availableWidth / fit.scale : undefined,
          transform: `translate(-50%, -50%) scale(${fit.scale})`,
        }}
      >
        {children}
      </div>
    </div>
  )
}
