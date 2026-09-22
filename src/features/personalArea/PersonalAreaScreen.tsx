import { DesktopScreenHeader } from "@/components/layout/DesktopScreenHeader"
import { EmptyState } from "@/components/ui/EmptyState"
import { Icon as PhosphorIcon } from "@/components/ui/PhosphorIcon"
import { assets } from "@/lib/assets"
import { BookmarkSimple, Heart, Basket, Suitcase, CarSimple, UsersThree } from "@phosphor-icons/react"
import type { Icon as PhosphorIconComponent } from "@phosphor-icons/react"

/**
 * "אזור אישי" (Personal Area) dashboard: a read-only overview of everything
 * the person has saved across the product — saved names, saved gear,
 * hospital-bag progress, outing lists, saved professionals — each as one
 * preview card that links nowhere yet (see the brief: UI and navigation
 * structure only, no new data layer).
 *
 * Reachable from the desktop sidebar's own "אזור אישי" item (App.tsx's
 * NAV_GROUPS) and, on mobile, from the Home screen's "אזור אישי" button —
 * so like its sibling screens (Gear/Leaving/Professionals) it follows the
 * mobile-hero / desktop-DesktopScreenHeader split rather than being
 * desktop-only.
 *
 * There's no real saved-items data source wired up yet (see the brief: UI
 * and navigation structure only, no new data layer), so every section
 * starts with zero items — the honest state given nothing is actually
 * saved anywhere yet — and the screen falls back to the empty-state
 * illustration below. `SECTIONS` is still the real per-category shape
 * (icon, title, count, preview) so wiring in real saved-item data later is
 * a matter of filling these arrays in, not touching the layout.
 */
type PersonalSection = {
  id: string
  icon: PhosphorIconComponent
  title: string
  count: string
  preview: string[]
  hasMore?: boolean
}

const SECTIONS: PersonalSection[] = [
  { id: "names", icon: Heart, title: "שמות שאהבתי", count: "0 שמות", preview: [] },
  { id: "gear", icon: Basket, title: "ציוד לתינוק", count: "0 פריטים", preview: [] },
  { id: "hospitalBag", icon: Suitcase, title: "תיק לידה", count: "0 פריטים", preview: [] },
  { id: "leaving", icon: CarSimple, title: "לפני שיוצאים", count: "0 רשימות", preview: [] },
  { id: "professionals", icon: UsersThree, title: "בעלי מקצוע", count: "0 בעלי מקצוע", preview: [] },
]

/**
 * One saved-content preview card — same shell, icon-circle and count-badge
 * language as `ChecklistCategoryCard` (border-[#f0e8e0], rounded-xl, white,
 * the soft card shadow), but showing a flat preview list instead of
 * checkable rows, since this content isn't a checklist.
 */
function PersonalAreaCard({ icon, title, count, preview, hasMore }: PersonalSection) {
  return (
    <div className="flex h-full flex-col gap-3 rounded-xl border border-[#f0e8e0] bg-white p-4 shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span aria-hidden className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[rgba(255,217,222,0.4)]">
            <PhosphorIcon icon={icon} size={22} weight="duotone" color="#6f1e35" />
          </span>
          <span className="truncate text-[18px] font-semibold leading-6 text-[#1d1b19]">{title}</span>
        </div>
        <span className="shrink-0 rounded-full bg-[#f3ede8] px-2 py-0.5 text-[13px] font-semibold leading-[18px] text-[#544245]">
          {count}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-[#f0e8e0] pt-3">
        {preview.map((item) => (
          <span
            key={item}
            className="rounded-full bg-[#faf7f4] px-3 py-1 text-[14px] leading-5 text-[#544245]"
          >
            {item}
          </span>
        ))}
        {hasMore ? <span className="px-1 text-[14px] leading-5 font-medium text-[#6f1e35]">עוד...</span> : null}
      </div>
    </div>
  )
}

type PersonalAreaScreenProps = {
  onBack: () => void
}

export function PersonalAreaScreen({ onBack }: PersonalAreaScreenProps) {
  // Empty across the board only when every section has nothing saved in it —
  // not per-section, since a single empty category (e.g. no saved
  // professionals yet) is still a normal, populated Personal Area.
  const hasAnyItems = SECTIONS.some((section) => section.preview.length > 0)

  const content = hasAnyItems ? (
    <div className="mt-4 grid max-w-[1200px] grid-cols-1 gap-4 lg:grid-cols-2">
      {SECTIONS.map((section) => (
        <PersonalAreaCard key={section.id} {...section} />
      ))}
    </div>
  ) : (
    <div className="mt-4 max-w-[1200px]">
      <EmptyState
        image={assets.emptyStateBrain}
        title="אין עדיין פריטים להצגה"
        description="כשתוסיפי רשימות הן יופיעו כאן"
      />
    </div>
  )

  return (
    <div className="px-1 pb-6 pt-2 sm:px-0" dir="rtl">
      {/* Mobile hero — same convention as Gear/Leaving/Professionals: a back
          link, a centered icon standing in for those screens' illustration
          (there's no dedicated Personal Area artwork), title and subtitle. */}
      <div className="sm:hidden">
        <button
          type="button"
          onClick={onBack}
          className="mb-2 flex items-center gap-1 self-end text-[14px] font-medium text-[#6f1e35]"
        >
          ← חזרה
        </button>

        <div className="flex flex-col items-center pb-2 pt-1 text-center">
          <span
            aria-hidden
            className="mb-1 flex size-28 items-center justify-center rounded-full bg-[rgba(255,217,222,0.4)]"
          >
            <PhosphorIcon icon={BookmarkSimple} size={48} weight="duotone" color="#6f1e35" />
          </span>
          <h1 className="text-[26px] font-black leading-[34px] text-[#6f1e35]">אזור אישי</h1>
          <p className="mt-1 text-[14px] leading-[22px] text-[#544245]">כל מה ששמרת בטפשת במקום אחד</p>
        </div>

        {content}
      </div>

      {/* Desktop — compact header + the same card grid (or empty state). */}
      <div className="hidden sm:block">
        <DesktopScreenHeader
          icon={<PhosphorIcon icon={BookmarkSimple} size={26} weight="duotone" color="#6f1e35" />}
          title="אזור אישי"
          subtitle="כל מה ששמרת בטפשת במקום אחד"
        />

        {content}
      </div>
    </div>
  )
}
