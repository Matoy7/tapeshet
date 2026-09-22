import type { ReactNode } from "react"
import { DesktopScreenHeader } from "@/components/layout/DesktopScreenHeader"
import { EmptyState } from "@/components/ui/EmptyState"
import { Icon as PhosphorIcon } from "@/components/ui/PhosphorIcon"
import { assets } from "@/lib/assets"
import { GEAR_CATEGORIES } from "@/data/babyGear"
import { LEAVING_CATEGORIES } from "@/data/leaving"
import { PROFESSIONALS } from "@/data/professionals"
import type { NameCardData } from "@/features/names/NameCard"
import { BookmarkSimple, Heart, Basket, UsersThree, X } from "@phosphor-icons/react"

/**
 * "אזור אישי" (Personal Area) — the single place that gathers everything the
 * person has personally selected, saved or liked anywhere else on Tapeshet:
 * favorited names, favorited professionals, checked-off equipment (grouped
 * by which checklist category it came from) and checked-off items from the
 * "לפני שיוצאים" outing checklist.
 *
 * Every list below is a *view* over state that's actually owned in App.tsx
 * and used by the screens where the person made the selection — this
 * component never keeps its own copy, so favoriting/checking anywhere
 * (including the removable chips rendered right here) is reflected
 * everywhere else immediately, and vice versa. See App.tsx's "lifted out of
 * BabyGearScreen/LeavingScreen/ProfessionalsScreen" comment for where each
 * piece of state actually lives.
 */
type PersonalAreaScreenProps = {
  names: NameCardData[]
  nameFavorites: Map<string, boolean>
  onToggleNameFavorite: (nameId: string) => void
  gearChecked: Set<string>
  onToggleGear: (id: string) => void
  leavingChecked: Set<string>
  onToggleLeaving: (id: string) => void
  professionalFavorites: Set<string>
  onToggleProfessionalFavorite: (id: string) => void
}

type Chip = { key: string; label: string; onRemove: () => void }

/** One removable saved item — the same pill/× convention the Leaving/
 * Professionals filter-chip rows already use, so "this is something you
 * chose and can undo" reads consistently across the app. */
function RemovableChip({ chip }: { chip: Chip }) {
  return (
    <span className="flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-[#f3ede8] ps-1 pe-3 text-[14px] font-medium text-[#1d1b19]">
      <button
        type="button"
        onClick={chip.onRemove}
        aria-label={`הסרת ${chip.label}`}
        className="flex size-6 shrink-0 items-center justify-center rounded-full text-[#877275] transition-colors duration-150 hover:bg-[#e9e1d9] hover:text-[#1d1b19]"
      >
        <PhosphorIcon icon={X} size={11} color="currentColor" weight="bold" />
      </button>
      <span>{chip.label}</span>
    </span>
  )
}

/** Card shell shared by every section — icon circle, title and a real
 * item-count badge, same language as `ChecklistCategoryCard`/`Card`
 * elsewhere in the app. Only ever rendered for a section that actually has
 * items — see `hasAnyItems`/the per-section `.length > 0` guards below: once
 * anything is saved anywhere, a still-empty section is left out entirely
 * rather than shown with a placeholder message. */
function PersonalAreaCard({
  icon,
  title,
  count,
  children,
}: {
  icon: ReactNode
  title: string
  count: number
  children: ReactNode
}) {
  return (
    <div className="flex h-full flex-col gap-3 rounded-xl border border-[#f0e8e0] bg-white p-4 shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span aria-hidden className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[rgba(255,217,222,0.4)]">
            {icon}
          </span>
          <span className="truncate text-[18px] font-semibold leading-6 text-[#1d1b19]">{title}</span>
        </div>
        <span className="shrink-0 rounded-full bg-[#f3ede8] px-2 py-0.5 text-[13px] font-semibold leading-[18px] text-[#544245]">
          {count}
        </span>
      </div>

      <div className="border-t border-[#f0e8e0] pt-3">{children}</div>
    </div>
  )
}

export function PersonalAreaScreen({
  names,
  nameFavorites,
  onToggleNameFavorite,
  gearChecked,
  onToggleGear,
  leavingChecked,
  onToggleLeaving,
  professionalFavorites,
  onToggleProfessionalFavorite,
}: PersonalAreaScreenProps) {
  // ---- Things I Like — checked "לפני שיוצאים" items --------------------
  const likedItems: Chip[] = LEAVING_CATEGORIES.flatMap((category) =>
    category.items
      .filter((item) => leavingChecked.has(item.id))
      .map((item) => ({
        key: item.id,
        label: item.label,
        onRemove: () => onToggleLeaving(item.id),
      })),
  )

  // ---- Selected Baby Equipment — checked gear items, grouped by their
  // original checklist category, per the brief. --------------------------
  const gearGroups = GEAR_CATEGORIES.map((category) => ({
    id: category.id,
    title: category.title,
    icon: category.icon,
    items: category.items.filter((item) => gearChecked.has(item.id)),
  })).filter((group) => group.items.length > 0)
  const gearCount = gearGroups.reduce((sum, g) => sum + g.items.length, 0)

  // ---- Favorite Professionals --------------------------------------------
  const favoriteProfessionals: Chip[] = PROFESSIONALS.filter((p) => professionalFavorites.has(p.id)).map((p) => ({
    key: p.id,
    label: p.name,
    onRemove: () => onToggleProfessionalFavorite(p.id),
  }))

  // ---- Favorite Names -----------------------------------------------------
  const favoriteNames: Chip[] = names
    .filter((n) => nameFavorites.get(n.nameId))
    .map((n) => ({
      key: n.nameId,
      label: n.text,
      onRemove: () => onToggleNameFavorite(n.nameId),
    }))

  const hasAnyItems =
    likedItems.length > 0 || gearGroups.length > 0 || favoriteProfessionals.length > 0 || favoriteNames.length > 0

  const content = hasAnyItems ? (
    <div className="mt-4 grid max-w-[1200px] grid-cols-1 gap-4 lg:grid-cols-2">
      {likedItems.length > 0 ? (
        <PersonalAreaCard
          icon={<PhosphorIcon icon={Heart} size={22} weight="duotone" color="#6f1e35" />}
          title="דברים שאהבתי"
          count={likedItems.length}
        >
          <div className="flex flex-wrap items-center gap-2">
            {likedItems.map((chip) => (
              <RemovableChip key={chip.key} chip={chip} />
            ))}
          </div>
        </PersonalAreaCard>
      ) : null}

      {gearGroups.length > 0 ? (
        <PersonalAreaCard
          icon={<PhosphorIcon icon={Basket} size={22} weight="duotone" color="#6f1e35" />}
          title="ציוד שנבחר"
          count={gearCount}
        >
          <div className="flex flex-col gap-3">
            {gearGroups.map((group) => (
              <div key={group.id} className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[#877275]">
                  <PhosphorIcon icon={group.icon} size={14} weight="duotone" color="#877275" />
                  <span>{group.title}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {group.items.map((item) => (
                    <RemovableChip
                      key={item.id}
                      chip={{ key: item.id, label: item.label, onRemove: () => onToggleGear(item.id) }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </PersonalAreaCard>
      ) : null}

      {favoriteProfessionals.length > 0 ? (
        <PersonalAreaCard
          icon={<PhosphorIcon icon={UsersThree} size={22} weight="duotone" color="#6f1e35" />}
          title="בעלי מקצוע מועדפים"
          count={favoriteProfessionals.length}
        >
          <div className="flex flex-wrap items-center gap-2">
            {favoriteProfessionals.map((chip) => (
              <RemovableChip key={chip.key} chip={chip} />
            ))}
          </div>
        </PersonalAreaCard>
      ) : null}

      {favoriteNames.length > 0 ? (
        <PersonalAreaCard
          icon={<PhosphorIcon icon={Heart} size={22} weight="duotone" color="#6f1e35" />}
          title="שמות מועדפים"
          count={favoriteNames.length}
        >
          <div className="flex flex-wrap items-center gap-2">
            {favoriteNames.map((chip) => (
              <RemovableChip key={chip.key} chip={chip} />
            ))}
          </div>
        </PersonalAreaCard>
      ) : null}
    </div>
  ) : (
    <div className="mt-4 max-w-[1200px]">
      <EmptyState
        image={assets.emptyStateBrain}
        title="אין עדיין פריטים להצגה"
        description="כשתוסיפי רשימות, פריטים או שמות, הם יופיעו כאן."
      />
    </div>
  )

  return (
    <div className="px-1 pb-6 pt-2 sm:px-0" dir="rtl">
      {/* Mobile hero — same convention as Gear/Leaving/Professionals: a
          centered icon standing in for those screens' illustration (there's
          no dedicated Personal Area artwork), title and subtitle. No
          "← חזרה" link any more (removed everywhere per the request);
          navigation back to Home is via the sidebar/drawer only. */}
      <div className="sm:hidden">
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
