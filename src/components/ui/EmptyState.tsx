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
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        {image ? <img src={image} alt="" aria-hidden className="mb-1 h-32 w-32 object-contain" /> : null}
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
