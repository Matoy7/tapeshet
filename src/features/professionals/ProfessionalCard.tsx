import { useState, type CSSProperties } from "react"
import { Icon as PhosphorIcon } from "@/components/ui/PhosphorIcon"
import { Star, MapPin, Phone, Heart } from "@phosphor-icons/react"
import { useGeneratedAvatar } from "@/lib/avatar"
import { cn } from "@/lib/cn"
import type { Professional } from "@/data/professionals"

function Tag({ label, size = "sm" }: { label: string; size?: "sm" | "md" }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center whitespace-nowrap rounded-full bg-[#ede7e2] font-medium text-[#544245]",
        size === "md" ? "h-7 px-3 text-[13px]" : "h-6 px-2.5 text-caption",
      )}
    >
      {label}
    </span>
  )
}

function RatingRow({ rating, reviewCount }: { rating: number | null; reviewCount: number }) {
  if (rating === null) {
    return <p className="text-[13px] text-[#877275]">אין עדיין דירוגים</p>
  }
  return (
    <p className="flex items-center gap-1 text-[13px] font-medium text-[#1d1b19]">
      <PhosphorIcon icon={Star} size={14} color="#f0a63a" weight="fill" />
      <span>{rating.toFixed(1)}</span>
      <span className="text-[#877275]">· {reviewCount} דירוגים</span>
    </p>
  )
}

/**
 * Phone stays hidden until the person actively asks for it — a small guard
 * against a directory being scraped for numbers wholesale, and it matches
 * the brief's CTA copy exactly ("הצגת מספר", never "לצפייה בפרופיל" or
 * "למידע נוסף"). Once revealed, the same control becomes the number itself
 * as a tel: link, so there's still exactly one action, not two.
 */
// Exported so other screens that show a professional's contact action (the
// Personal Area dashboard's recommended-professionals card) reuse this exact
// reveal-then-call behavior instead of a second, drifting copy of it.
export function ShowPhoneButton({
  phone,
  className,
  style,
}: {
  phone: string
  className?: string
  style?: CSSProperties
}) {
  const [revealed, setRevealed] = useState(false)

  if (revealed) {
    return (
      <a
        href={`tel:${phone}`}
        dir="ltr"
        style={style}
        className={cn(
          "flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[#ffd9de] text-[15px] font-bold text-[#6f1e35] transition-opacity hover:opacity-90",
          className,
        )}
      >
        {phone}
      </a>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setRevealed(true)}
      style={style}
      className={cn(
        "flex h-10 w-full items-center justify-center gap-1.5 rounded-full bg-[#ffd9de] text-[15px] font-bold text-[#6f1e35] transition-opacity hover:opacity-90",
        className,
      )}
    >
      <PhosphorIcon icon={Phone} size={15} color="#6f1e35" weight="fill" />
      הצגת מספר
    </button>
  )
}

type ProfessionalCardProps = {
  professional: Professional
  favorited: boolean
  onToggleFavorite: (id: string) => void
}

/**
 * Mobile and desktop render as two separate blocks (sm:hidden / hidden
 * sm:flex) sharing the same data — the same deliberate split NameCard uses,
 * since the mobile reference (round avatar photo beside the name, one
 * stacked column) and the desktop reference (no avatar, a header row with
 * a badge-style title) are genuinely different card anatomies, not the same
 * markup in different widths.
 */
export function ProfessionalCard({ professional: p, favorited, onToggleFavorite }: ProfessionalCardProps) {
  const avatar = useGeneratedAvatar(p.id)

  return (
    <>
      {/* ---------------------------------------------------------------- Mobile */}
      <article className="flex w-full flex-col gap-3 rounded-xl bg-white p-4 shadow-[0px_1px_1px_rgba(0,0,0,0.05)] sm:hidden">
        <div className="flex items-start gap-3">
          {avatar ? (
            <img src={avatar} alt="" aria-hidden className="size-14 shrink-0 rounded-full bg-[#f8f3ee] object-cover" />
          ) : (
            <span aria-hidden className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[#f8f3ee]" />
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate text-[17px] font-bold leading-6 text-[#6f1e35]">{p.name}</p>
            <p className="truncate text-[13px] leading-[18px] text-[#8a5a63]">{p.title}</p>
          </div>

          <button
            type="button"
            aria-pressed={favorited}
            aria-label={favorited ? "הסירו מהמועדפים" : "הוסיפו למועדפים"}
            onClick={() => onToggleFavorite(p.id)}
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-full transition-colors",
              favorited ? "bg-[#ffd9de]" : "bg-[#f8f3ee]",
            )}
          >
            <PhosphorIcon icon={Heart} size={16} color="#6f1e35" weight={favorited ? "fill" : "regular"} />
          </button>
        </div>

        <RatingRow rating={p.rating} reviewCount={p.reviewCount} />

        <p className="flex items-center gap-1 text-[13px] text-[#544245]">
          <PhosphorIcon icon={MapPin} size={13} color="#877275" />
          {p.areaLabel}
        </p>

        {p.displayTags.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            {p.displayTags.slice(0, 2).map((tag) => (
              <Tag key={tag} label={tag} size="md" />
            ))}
          </div>
        ) : null}

        <ShowPhoneButton phone={p.phone} />
      </article>

      {/* --------------------------------------------------------------- Desktop */}
      <article className="hidden h-full w-full flex-col justify-between gap-4 rounded-xl border border-border-subtle bg-surface p-5 shadow-name-card transition-shadow duration-150 hover:shadow-name-card-hover sm:flex">
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <button
              type="button"
              aria-pressed={favorited}
              aria-label={favorited ? "הסירו מהמועדפים" : "הוסיפו למועדפים"}
              onClick={() => onToggleFavorite(p.id)}
              className="shrink-0"
            >
              <PhosphorIcon icon={Heart} size={18} color="#6f1e35" weight={favorited ? "fill" : "regular"} />
            </button>
            <div className="min-w-0 flex-1 text-right">
              <p className="truncate font-display text-card-title font-bold text-primary">{p.name}</p>
              <p className="mt-0.5 truncate text-body-sm text-content-muted">{p.title}</p>
            </div>
          </div>

          <p className="flex items-center justify-end gap-1 text-body-sm text-content-secondary">
            {p.areaLabel}
            <PhosphorIcon icon={MapPin} size={13} color="#877275" />
          </p>

          <div className="flex items-center justify-end gap-1">
            <RatingRow rating={p.rating} reviewCount={p.reviewCount} />
          </div>

          {p.displayTags.length > 0 ? (
            <div className="flex flex-wrap items-center justify-end gap-1.5">
              {p.displayTags.slice(0, 2).map((tag) => (
                <Tag key={tag} label={tag} />
              ))}
            </div>
          ) : null}
        </div>

        <ShowPhoneButton phone={p.phone} />
      </article>
    </>
  )
}
