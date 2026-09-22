import type { ReactNode } from "react"
import { Card } from "./Card"

type EmptyStateProps = {
  /** Optional illustration shown above the title — omit for the plain
   * text-only empty state every existing screen still uses. */
  image?: string
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ image, title, description, action }: EmptyStateProps) {
  return (
    <Card padding="lg">
      {/* Less top padding than the default py-8 when there's an illustration
       * to show — pulls it up slightly so it doesn't float in an
       * oversized gap under the card's own top padding, while the bottom
       * stays at py-8 either way. Text-only usage (no image) is untouched. */}
      <div className={image ? "flex flex-col items-center gap-3 pb-8 pt-4 text-center" : "flex flex-col items-center gap-3 py-8 text-center"}>
        {/* ~220px on mobile, ~310px from `sm:` up — the illustration as the
         * main visual of the empty state, not a small placeholder — with
         * `max-w-full h-auto` as a safety net on very narrow phones. */}
        {image ? (
          <img src={image} alt="" aria-hidden className="mb-8 h-auto w-[220px] max-w-full object-contain sm:w-[310px]" />
        ) : null}
        <h3 className="text-card-title font-semibold text-content-primary">
          {title}
        </h3>
        {description ? (
          <p className="max-w-[420px] text-body-sm text-content-muted">
            {description}
          </p>
        ) : null}
        {action ? <div className="pt-1">{action}</div> : null}
      </div>
    </Card>
  )
}
