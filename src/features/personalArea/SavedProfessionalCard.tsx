import { Icon as PhosphorIcon } from "@/components/ui/PhosphorIcon"
import { Star, MapPin, Heart, CaretLeft } from "@phosphor-icons/react"
import { useGeneratedAvatar } from "@/lib/avatar"
import { cn } from "@/lib/cn"
import type { Professional } from "@/data/professionals"
import {
  AVAILABILITY_OPTIONS,
  CATEGORY_LABELS,
  SERVICE_MODE_OPTIONS,
  type FilterOption,
} from "@/features/professionals/filterOptions"
import { ShowPhoneButton } from "@/features/professionals/ProfessionalCard"

function labelFor(options: FilterOption[], value: string): string | undefined {
  return options.find((o) => o.value === value)?.label
}

type SavedProfessionalCardProps = {
  professional: Professional
  onToggleFavorite: (id: string) => void
  onOpenDetails: () => void
}

/**
 * A saved professional, shown fully expanded inside אזור אישי's
 * "בעלי מקצוע מומלצים" card — everything already on file for them is
 * visible at once (category, name, role, avatar, rating, area, service
 * mode, availability, specialties, price when published, phone), so the
 * person can tell who this is and why it's saved without expanding or
 * navigating anywhere.
 *
 * Only real data is rendered: a field the dataset doesn't have for this
 * professional (e.g. price, rating) is left out rather than filled with a
 * placeholder. The dataset has no free-text bio field, so the role line
 * (`title`, e.g. "מוהל רפואי") is the description.
 *
 * Same visual language as the Professionals screen's own card (white,
 * hairline border, rounded-xl, burgundy name, soft-pink heart/CTA), kept
 * compact — a profile row inside a dashboard, not a marketing tile. Text
 * sits at this page's 16px floor where it carries content.
 */
export function SavedProfessionalCard({ professional: p, onToggleFavorite, onOpenDetails }: SavedProfessionalCardProps) {
  const avatar = useGeneratedAvatar(p.id)
  const serviceModes = p.serviceModes.map((m) => labelFor(SERVICE_MODE_OPTIONS, m)).filter(Boolean) as string[]
  const availability = p.availability.map((a) => labelFor(AVAILABILITY_OPTIONS, a)).filter(Boolean) as string[]

  return (
    <article className="flex min-w-0 flex-col gap-3 rounded-xl border border-[#f0e8e0] bg-white p-4">
      {/* Identity: avatar, category, name, role — heart on the far side. */}
      <div className="flex items-start gap-3">
        {avatar ? (
          <img src={avatar} alt="" aria-hidden className="size-14 shrink-0 rounded-full bg-[#f8f3ee] object-cover" />
        ) : (
          <span aria-hidden className="size-14 shrink-0 rounded-full bg-[#f8f3ee]" />
        )}

        <div className="min-w-0 flex-1">
          <span className="inline-flex h-6 items-center rounded-full bg-[rgba(255,217,222,0.5)] px-2.5 text-[13px] font-semibold text-[#6f1e35]">
            {CATEGORY_LABELS[p.category]}
          </span>
          <p className="mt-1 truncate text-[17px] font-bold leading-6 text-[#6f1e35]">{p.name}</p>
          <p className="truncate text-[16px] leading-5 text-[#8a5a63]">{p.title}</p>
        </div>

        <button
          type="button"
          aria-pressed
          aria-label="הסירו מהמועדפים"
          onClick={() => onToggleFavorite(p.id)}
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#ffd9de] transition-opacity hover:opacity-90"
        >
          <PhosphorIcon icon={Heart} size={16} color="#6f1e35" weight="fill" />
        </button>
      </div>

      {/* Rating + area on one line, wrapping on narrow widths. */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[16px] leading-5">
        {p.rating !== null ? (
          <span className="flex items-center gap-1 font-medium text-[#1d1b19]">
            <PhosphorIcon icon={Star} size={15} color="#f0a63a" weight="fill" />
            <span>{p.rating.toFixed(1)}</span>
            <span className="font-normal text-[#877275]">· {p.reviewCount} דירוגים</span>
          </span>
        ) : (
          <span className="text-[#877275]">אין עדיין דירוגים</span>
        )}
        <span className="flex items-center gap-1 text-[#544245]">
          <PhosphorIcon icon={MapPin} size={15} color="#877275" />
          {p.areaLabel}
        </span>
      </div>

      {/* Service mode · availability · price — only what exists. */}
      {serviceModes.length > 0 || availability.length > 0 || p.price !== null ? (
        <p className="text-[16px] leading-5 text-[#544245]">
          {[...serviceModes, ...availability, ...(p.price !== null ? [`₪${p.price.toLocaleString("he-IL")}`] : [])].join(
            " · ",
          )}
        </p>
      ) : null}

      {p.displayTags.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5">
          {p.displayTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex h-7 items-center whitespace-nowrap rounded-full bg-[#f3ede8] px-3 text-[14px] font-medium text-[#544245]"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-auto flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          onClick={onOpenDetails}
          className={cn(
            "flex h-10 min-w-[120px] flex-1 items-center justify-center gap-1.5 rounded-full bg-[#6f1e35] text-[15px] font-bold text-white transition-opacity hover:opacity-90",
          )}
        >
          לפרטים
          <PhosphorIcon icon={CaretLeft} size={14} color="#ffffff" weight="bold" />
        </button>
        <ShowPhoneButton phone={p.phone} className="min-w-[120px] flex-1" />
      </div>
    </article>
  )
}
