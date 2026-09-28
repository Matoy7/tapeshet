import { FavoriteButton } from "./FavoriteButton"
import { originTag, meaningTag, styleTag, type CardTag } from "./tagColors"
import { cn } from "@/lib/cn"
import { Icon as PhosphorIcon } from "@/components/ui/PhosphorIcon"
import { Heart } from "@phosphor-icons/react"
import type { Origin, Meaning, Style } from "@/data/names"

/**
 * Mobile-only heart glyph. The reference always renders the same outline
 * heart regardless of saved state — only its circular background toggles
 * color — so this stays a single constant burgundy-stroke glyph.
 */
function MobileHeartGlyph() {
  return <PhosphorIcon icon={Heart} size={16} color="#6f1e35" weight="regular" />
}

export type NameCardData = {
  nameId: string
  text: string
  gender: "boy" | "girl" | "unisex" | null
  origin: string | null
  origins: Origin[]
  meanings: Meaning[]
  styles: Style[]
  meaningHe: string | null
  meaningConfidence: "verified" | "uncertain" | null
}

const GENDER_LABEL: Record<"boy" | "girl" | "unisex", string> = {
  boy: "לבן",
  girl: "לבת",
  unisex: "יוניסקס",
}

// Desktop-only badge — recolored to the same warm-neutral family the mobile
// tags use (see TagMobile below) instead of the old per-gender blue/pink
// pastel tints, which were off the Tafsheet palette (blue especially) and
// made the desktop card read as a different product from mobile.
function GenderPill({ gender }: { gender: "boy" | "girl" | "unisex" }) {
  return (
    <span className="inline-flex h-6 shrink-0 items-center rounded-full bg-[#ede7e2] px-2.5 text-caption font-medium text-[#544245]">
      {GENDER_LABEL[gender]}
    </span>
  )
}

/**
 * Desktop tag — same warm-neutral fill/text as the mobile tag (TagMobile
 * below), not the old per-value rainbow swatch from tagColors.ts. Filters
 * and name cards now share one color language across breakpoints, per the
 * Tafsheet visual language: no rainbow tag system anywhere.
 */
function TagDesktop({ tag }: { tag: CardTag }) {
  return (
    <span className="inline-flex h-6 shrink-0 items-center whitespace-nowrap rounded-full bg-[#ede7e2] px-2.5 text-caption font-medium text-[#544245]">
      {tag.label}
    </span>
  )
}

/**
 * Mobile tag — one shared warm-neutral treatment for every tag regardless
 * of origin/meaning/style, per the approved Tafsheet visual language: no
 * rainbow tag system, everything stays inside the cream/burgundy/pink
 * family. `tag.swatch` (the desktop rainbow color) is deliberately unused
 * here — mobile tags are visually uniform on purpose.
 */
function TagMobile({ tag }: { tag: CardTag }) {
  return (
    <span className="inline-flex h-7 shrink-0 items-center whitespace-nowrap rounded-full bg-[#ede7e2] px-3 text-[13px] font-medium text-[#544245]">
      {tag.label}
    </span>
  )
}

type NameCardProps = {
  name: NameCardData
  favorited: boolean
  onToggleFavorite: (nameId: string) => void
}

/**
 * Deliberately minimal: no illustration, no decorative iconography anywhere
 * near the name — the name and its meaning are the entire visual point of
 * the card. Tags come straight from the name's real origin/meaning/style
 * flags — one of each, at most, so a card never turns into a wall of pills.
 *
 * Mobile and desktop render as two separate blocks (one `sm:hidden`, one
 * `hidden sm:block`) sharing the same `tags`/`favorited`/`onToggleFavorite`
 * — not two independent controls, one shared state rendered twice. This is
 * deliberate, not a shortcut: the Tafsheet mobile reference's card anatomy
 * is a single row (name+meaning+tags stacked in one text column, a heart
 * pinned beside it, no divider) which is a genuinely different DOM shape
 * from the existing desktop card (header row, then meaning, then a
 * divider, then a footer row) — coercing one shared markup tree into both
 * with pure responsive classes would mean fighting Tailwind's utilities
 * rather than reproducing either layout faithfully. Desktop's block below
 * is untouched, byte-for-byte, from before this mobile pass.
 */
export function NameCard({ name, favorited, onToggleFavorite }: NameCardProps) {
  const tags: CardTag[] = [
    ...name.origins.slice(0, 1).map(originTag),
    ...name.meanings.slice(0, 1).map(meaningTag),
    ...name.styles.slice(0, 1).map(styleTag),
  ].slice(0, 3)

  return (
    <>
      {/* ------------------------------------------------------------------
          Mobile — Tafsheet visual language: white card, cream page behind
          it, burgundy type, warm-neutral tags, heart pinned beside the
          text column (not in a header/footer split).
      ------------------------------------------------------------------ */}
      <article className="flex w-full items-start justify-between gap-4 rounded-xl bg-white p-5 shadow-[0px_1px_1px_rgba(0,0,0,0.05)] sm:hidden">
        <div className="flex min-w-0 flex-1 flex-col items-start text-right">
          <p dir="auto" className="mb-1 w-full text-right font-sans text-[20px] font-semibold leading-7 text-[#6f1e35]">
            {name.text}
          </p>

          {name.meaningHe ? (
            <p className="mb-3 font-sans text-[15px] leading-5 text-[#1d1b19]">
              {name.meaningHe}
              {name.meaningConfidence === "uncertain" ? (
                <span className="me-1 opacity-70" title="מקור המשמעות אינו ודאי">
                  (לא ודאי)
                </span>
              ) : null}
            </p>
          ) : null}

          {tags.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              {tags.map((tag) => (
                <TagMobile key={tag.key} tag={tag} />
              ))}
            </div>
          ) : null}
        </div>

        <button
          type="button"
          aria-pressed={favorited}
          aria-label={favorited ? "הסירו מהשמות השמורים" : "שמרו את השם הזה"}
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onToggleFavorite(name.nameId)
          }}
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-full transition-colors",
            favorited ? "bg-[#ffd9de]" : "bg-[#f8f3ee]",
          )}
        >
          <MobileHeartGlyph />
        </button>
      </article>

      {/* ------------------------------------------------------------------
          Desktop — unchanged from before the mobile pass.
      ------------------------------------------------------------------ */}
      <article className="hidden h-full min-h-[196px] w-full flex-col justify-between rounded-xl border border-border-subtle bg-surface p-6 shadow-name-card transition-shadow duration-150 hover:shadow-name-card-hover sm:flex">
        <div>
          <div className="flex items-start justify-between gap-3">
            <p
              dir="auto"
              className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-display text-quote font-bold leading-snug text-primary"
            >
              {name.text}
            </p>
            {name.gender ? <GenderPill gender={name.gender} /> : null}
          </div>

          {name.meaningHe ? (
            <p className="mt-2 line-clamp-2 text-body-sm leading-relaxed text-content-muted">
              {name.meaningHe}
              {name.meaningConfidence === "uncertain" ? (
                <span className="ms-1 text-content-muted/70" title="מקור המשמעות אינו ודאי">
                  (לא ודאי)
                </span>
              ) : null}
            </p>
          ) : null}
        </div>

        <div>
          <div className="mb-4 h-px bg-border-subtle" aria-hidden />
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 flex-wrap items-center justify-start gap-1.5">
              {tags.map((tag) => (
                <TagDesktop key={tag.key} tag={tag} />
              ))}
            </div>
            <FavoriteButton favorited={favorited} onToggle={() => onToggleFavorite(name.nameId)} />
          </div>
        </div>
      </article>
    </>
  )
}
