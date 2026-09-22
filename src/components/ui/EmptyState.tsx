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
        {/* Mobile stays exactly as it was (~220px, mb-8, card-title/content-
         * primary typography) — every desktop change below is `sm:`-scoped
         * so it only takes effect at the same breakpoint every other
         * screen's own mobile/desktop split uses. Desktop: ~460px wide
         * (the dominant visual, not a placeholder), `sm:mb-7` (28px) which,
         * combined with the parent's unconditional `gap-3` (12px), lands
         * the image-to-headline gap at the requested ~40px. */}
        {image ? (
          <img
            src={image}
            alt=""
            aria-hidden
            className="mb-8 h-auto w-[220px] max-w-full object-contain sm:mb-7 sm:w-[460px]"
          />
        ) : null}
        <h3
          className={
            image
              ? "text-card-title font-semibold text-content-primary sm:text-[30px] sm:font-bold sm:leading-9 sm:text-[#6f1e35]"
              : "text-card-title font-semibold text-content-primary"
          }
        >
          {title}
        </h3>
        {description ? (
          <p
            className={
              image
                ? "max-w-[420px] text-body-sm text-content-muted sm:max-w-[480px] sm:text-[17px] sm:font-normal sm:leading-6 sm:text-[#6f1e35]/70"
                : "max-w-[420px] text-body-sm text-content-muted"
            }
          >
            {description}
          </p>
        ) : null}
        {action ? <div className="pt-1">{action}</div> : null}
      </div>
    </Card>
  )
}
