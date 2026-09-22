import { DesktopScreenHeader } from "@/components/layout/DesktopScreenHeader"
import { Icon as PhosphorIcon } from "@/components/ui/PhosphorIcon"
import { BookmarkSimple, Heart, Basket, Suitcase, CarSimple, UsersThree } from "@phosphor-icons/react"
import type { Icon as PhosphorIconComponent } from "@phosphor-icons/react"

/**
 * Desktop-only "אזור אישי" (Personal Area) dashboard: a read-only overview
 * of everything the person has saved across the product — saved names,
 * saved gear, hospital-bag progress, outing lists, saved professionals —
 * each as one preview card that links nowhere yet (see the brief: UI and
 * navigation structure only, no new data layer).
 *
 * Reachable only through the desktop sidebar's own "אזור אישי" item (see
 * App.tsx's NAV_GROUPS) — there is no mobile entry point yet, so this
 * component assumes the `lg:` desktop layout throughout and doesn't attempt
 * a mobile variant of its own, unlike its sibling screens (Gear/Leaving/
 * Professionals), which each render both. The mobile "אזור אישי" button on
 * the Home screen stays exactly as it is: present, unstyled-inert, no
 * onClick.
 *
 * Every count/preview below is realistic placeholder content, per the
 * brief — swap in real saved-item data later without touching the layout.
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
  {
    id: "names",
    icon: Heart,
    title: "שמות שאהבתי",
    count: "12 שמות",
    preview: ["תמר", "אלה", "נועה", "מאיה"],
    hasMore: true,
  },
  {
    id: "gear",
    icon: Basket,
    title: "ציוד לתינוק",
    count: "18 פריטים",
    preview: ["עגלה", "מיטה", "מנשא", "כיסא בטיחות"],
    hasMore: true,
  },
  {
    id: "hospitalBag",
    icon: Suitcase,
    title: "תיק לידה",
    count: "14 פריטים",
    preview: ["תעודת זהות", "בגדים", "מטען", "מסמכים"],
    hasMore: true,
  },
  {
    id: "leaving",
    icon: CarSimple,
    title: "לפני שיוצאים",
    count: "9 רשימות",
    preview: ["טיול בטבע", "ביקור משפחה", "קניות"],
    hasMore: true,
  },
  {
    id: "professionals",
    icon: UsersThree,
    title: "בעלי מקצוע",
    count: "5 בעלי מקצוע",
    preview: ["יועצת הנקה", "דולה", "יועצת שינה"],
  },
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

export function PersonalAreaScreen() {
  return (
    <div className="hidden sm:block" dir="rtl">
      <DesktopScreenHeader
        icon={<PhosphorIcon icon={BookmarkSimple} size={26} weight="duotone" color="#6f1e35" />}
        title="אזור אישי"
        subtitle="כל מה ששמרת בטפשת במקום אחד"
      />

      <div className="mt-4 grid max-w-[1200px] grid-cols-1 gap-4 lg:grid-cols-2">
        {SECTIONS.map((section) => (
          <PersonalAreaCard key={section.id} {...section} />
        ))}
      </div>
    </div>
  )
}
