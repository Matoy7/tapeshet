import { useMemo, useState } from "react"
import { AccordionItem } from "@/components/ui/Accordion"
import { ChecklistCategoryCard } from "@/components/ui/ChecklistCategoryCard"
import { ChecklistCategoryGrid } from "@/components/ui/ChecklistCategoryGrid"
import { ChecklistItemList } from "@/components/ui/ChecklistItemList"
import { DesktopScreenHeader } from "@/components/layout/DesktopScreenHeader"
import { assets } from "@/lib/assets"
import { Icon as PhosphorIcon } from "@/components/ui/PhosphorIcon"
import { MultiFilterDropdown, type FilterOption } from "@/features/names/MultiFilterDropdown"
import { X, ShieldCheck } from "@phosphor-icons/react"
import {
  LEAVING_CATEGORIES as CATEGORIES,
  EMPTY_LEAVING_FILTERS as EMPTY_FILTERS,
  type ArrivalMethod,
  type OutingType,
  type Duration,
  type Distance,
  type BabyFit,
  type LeavingFilters,
} from "@/data/leaving"

/**
 * Filters here follow the exact same component (`MultiFilterDropdown`) and
 * chip-row convention as "בחירת שם" — no new filter control was invented for
 * this screen, per the request. Each dimension is its own dropdown pill,
 * multi-select, staged in a draft and committed on Apply/close.
 */
const ARRIVAL_OPTIONS: FilterOption<ArrivalMethod>[] = [
  { value: "walk", label: "הליכה" },
  { value: "car", label: "רכב" },
  { value: "public_transport", label: "תחבורה ציבורית" },
  { value: "taxi", label: "מונית" },
  { value: "flight", label: "טיסה" },
]

const OUTING_TYPE_OPTIONS: FilterOption<OutingType>[] = [
  { value: "outdoor", label: "בחוץ" },
  { value: "indoor", label: "בתוך מבנה" },
]

const DURATION_OPTIONS: FilterOption<Duration>[] = [
  { value: "up_to_hour", label: "עד שעה" },
  { value: "one_two_hours", label: "1–2 שעות" },
  { value: "two_four_hours", label: "2–4 שעות" },
  { value: "half_day", label: "חצי יום" },
  { value: "full_day", label: "יום שלם" },
  { value: "multiple_days", label: "כמה ימים" },
]

const DISTANCE_OPTIONS: FilterOption<Distance>[] = [
  { value: "near", label: "קרוב לבית" },
  { value: "up_to_30", label: "עד 30 דקות" },
  { value: "up_to_hour", label: "עד שעה" },
  { value: "up_to_two_hours", label: "עד שעתיים" },
  { value: "more_than_two_hours", label: "יותר משעתיים" },
]

const BABY_FIT_OPTIONS: FilterOption<BabyFit>[] = [
  { value: "stroller", label: "מתאים לעגלה" },
  { value: "carrier", label: "מתאים למנשא" },
  { value: "nursing_feeding", label: "מתאים להנקה / האכלה" },
]

type ChipData = { key: string; label: string; onRemove: () => void }

function Chip({ chip }: { chip: ChipData }) {
  return (
    <span className="flex h-7 shrink-0 items-center gap-1.5 rounded-full bg-[#f3ede8] ps-1 pe-2.5 text-[13px] font-medium text-[#1d1b19]">
      <button
        type="button"
        onClick={chip.onRemove}
        aria-label={`הסרת הסינון ${chip.label}`}
        className="flex size-5 shrink-0 items-center justify-center rounded-full text-[#877275] transition-colors duration-150 hover:bg-[#e9e1d9] hover:text-[#1d1b19]"
      >
        <PhosphorIcon icon={X} size={10} color="currentColor" weight="bold" />
      </button>
      <span>{chip.label}</span>
    </span>
  )
}

type LeavingScreenProps = {
  /** Lifted to App.tsx (not local state here anymore) so "אזור אישי" can
   * show the exact same checked items under "דברים שאהבתי" — one shared
   * Set, not a second copy that could drift out of sync. */
  checked: Set<string>
  onToggle: (id: string) => void
}

export function LeavingScreen({ checked, onToggle: toggle }: LeavingScreenProps) {
  const [filters, setFilters] = useState<LeavingFilters>(EMPTY_FILTERS)

  const hasActiveFilters =
    filters.arrival.length > 0 ||
    filters.outingType.length > 0 ||
    filters.duration.length > 0 ||
    filters.distance.length > 0 ||
    filters.babyFit.length > 0

  // Bring the categories most relevant to the active filters to the top —
  // conceptual guidance only, per the brief; nothing is ever hidden.
  const orderedCategories = useMemo(() => {
    if (!hasActiveFilters) return CATEGORIES
    const relevant = CATEGORIES.filter((c) => c.isRelevant(filters))
    const rest = CATEGORIES.filter((c) => !c.isRelevant(filters))
    return [...relevant, ...rest]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, hasActiveFilters])

  const totalItems = CATEGORIES.reduce((sum, c) => sum + c.items.length, 0)
  const totalDone = CATEGORIES.reduce((sum, c) => sum + c.items.filter((i) => checked.has(i.id)).length, 0)

  const chips: ChipData[] = []
  for (const opt of ARRIVAL_OPTIONS) {
    if (filters.arrival.includes(opt.value)) {
      chips.push({
        key: `arrival-${opt.value}`,
        label: opt.label,
        onRemove: () => setFilters((v) => ({ ...v, arrival: v.arrival.filter((x) => x !== opt.value) })),
      })
    }
  }
  for (const opt of OUTING_TYPE_OPTIONS) {
    if (filters.outingType.includes(opt.value)) {
      chips.push({
        key: `outing-${opt.value}`,
        label: opt.label,
        onRemove: () => setFilters((v) => ({ ...v, outingType: v.outingType.filter((x) => x !== opt.value) })),
      })
    }
  }
  for (const opt of DURATION_OPTIONS) {
    if (filters.duration.includes(opt.value)) {
      chips.push({
        key: `duration-${opt.value}`,
        label: opt.label,
        onRemove: () => setFilters((v) => ({ ...v, duration: v.duration.filter((x) => x !== opt.value) })),
      })
    }
  }
  for (const opt of DISTANCE_OPTIONS) {
    if (filters.distance.includes(opt.value)) {
      chips.push({
        key: `distance-${opt.value}`,
        label: opt.label,
        onRemove: () => setFilters((v) => ({ ...v, distance: v.distance.filter((x) => x !== opt.value) })),
      })
    }
  }
  for (const opt of BABY_FIT_OPTIONS) {
    if (filters.babyFit.includes(opt.value)) {
      chips.push({
        key: `babyFit-${opt.value}`,
        label: opt.label,
        onRemove: () => setFilters((v) => ({ ...v, babyFit: v.babyFit.filter((x) => x !== opt.value) })),
      })
    }
  }

  return (
    <div className="px-1 pb-6 pt-2 sm:px-0" dir="rtl">
      {/* Mobile hero — no "← חזרה" link any more (removed everywhere per
          the request); navigation back to Home is via the sidebar/drawer only. */}
      <div className="sm:hidden">
        <div className="flex flex-col items-center pb-2 pt-1 text-center">
          <img src={assets.homeLeaving} alt="" aria-hidden className="mb-1 h-28 w-28 object-contain" />
          <h1 className="text-[26px] font-black leading-[34px] text-[#6f1e35]">לפני שיוצאים</h1>
          <p className="mt-1 text-[14px] leading-[22px] text-[#544245]">
            רשימת הדברים שכדאי לבדוק לפני היציאה מהבית, כדי לצאת בראש שקט
          </p>
        </div>
      </div>

      {/* Desktop header — compact, illustration secondary to the checklist. */}
      <div className="hidden sm:block">
        <DesktopScreenHeader
          image={assets.homeLeaving}
          title="לפני שיוצאים"
          subtitle="רשימת הדברים שכדאי לבדוק לפני היציאה מהבית, כדי לצאת בראש שקט"
        />
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <MultiFilterDropdown
            label="אמצעי הגעה"
            options={ARRIVAL_OPTIONS}
            values={filters.arrival}
            onChange={(v) => setFilters((prev) => ({ ...prev, arrival: v }))}
          />
          <MultiFilterDropdown
            label="סוג הבילוי"
            options={OUTING_TYPE_OPTIONS}
            values={filters.outingType}
            onChange={(v) => setFilters((prev) => ({ ...prev, outingType: v }))}
          />
          <MultiFilterDropdown
            label="משך נסיעה / שהייה"
            options={DURATION_OPTIONS}
            values={filters.duration}
            onChange={(v) => setFilters((prev) => ({ ...prev, duration: v }))}
          />
          <MultiFilterDropdown
            label="מרחק מהבית"
            options={DISTANCE_OPTIONS}
            values={filters.distance}
            onChange={(v) => setFilters((prev) => ({ ...prev, distance: v }))}
          />
          <MultiFilterDropdown
            label="מתאים עם תינוק"
            options={BABY_FIT_OPTIONS}
            values={filters.babyFit}
            onChange={(v) => setFilters((prev) => ({ ...prev, babyFit: v }))}
          />
        </div>

        {chips.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[13px] font-medium text-[#877275]">סינון פעיל:</span>
            {chips.map((chip) => (
              <Chip key={chip.key} chip={chip} />
            ))}
            <button
              type="button"
              onClick={() => setFilters(EMPTY_FILTERS)}
              className="ms-1 text-[13px] font-medium text-[#6f1e35] hover:underline"
            >
              ניקוי הכל
            </button>
          </div>
        ) : null}

        <p className="text-[14px] font-medium text-[#544245]">
          הושלמו {totalDone} מתוך {totalItems}
        </p>
      </div>

      {/* Mobile: collapsible accordion, ordered by relevance — unchanged. */}
      <div className="mt-3 flex flex-col gap-2.5 sm:hidden">
        {orderedCategories.map((category) => {
          const doneCount = category.items.filter((i) => checked.has(i.id)).length
          const total = category.items.length
          const hasProgress = doneCount > 0
          return (
            <AccordionItem
              key={category.id}
              icon={<PhosphorIcon icon={category.icon} size={22} weight="duotone" color="#6f1e35" />}
              title={category.title}
              subtitle={category.subtitle}
              badge={
                <span
                  className={
                    "rounded-full px-2 py-0.5 text-[13px] font-semibold leading-[18px] " +
                    (hasProgress ? "bg-[#ffd9de] text-[#6f1e35]" : "bg-[#f3ede8] text-[#544245]")
                  }
                >
                  {doneCount}/{total}
                </span>
              }
            >
              <ChecklistItemList items={category.items} checked={checked} onToggle={toggle} variant="mobile" />
            </AccordionItem>
          )
        })}
      </div>

      {/* Desktop: every category open as its own card in a grid, ordered by
          the same relevance logic — categories are not collapsed on
          desktop, per the workspace-layout brief. */}
      <div className="mt-3 hidden sm:block">
        <ChecklistCategoryGrid>
          {orderedCategories.map((category) => (
            <ChecklistCategoryCard
              key={category.id}
              icon={<PhosphorIcon icon={category.icon} size={22} weight="duotone" color="#6f1e35" />}
              title={category.title}
              items={category.items}
              checked={checked}
              onToggle={toggle}
            />
          ))}
        </ChecklistCategoryGrid>
      </div>

      <div className="mx-1 mt-4 flex items-start gap-3 rounded-xl bg-[rgba(255,218,214,0.3)] p-3.5 sm:mx-0 sm:max-w-[1200px]">
        <span aria-hidden className="mt-0.5 shrink-0">
          <PhosphorIcon icon={ShieldCheck} size={16} weight="duotone" color="#6f1e35" />
        </span>
        <p className="text-right text-[12px] leading-[16.5px] text-[#1d1b19] sm:text-[14px] sm:leading-5">
          <span className="font-bold">טיפ: </span>
          <span className="font-normal">
            עדיף להכין מראש כדי לצאת בנחת ולהינות מהרגע. גם אם שכחתם משהו — את עדיין עושה את זה מעולה.
          </span>
        </p>
      </div>
    </div>
  )
}
