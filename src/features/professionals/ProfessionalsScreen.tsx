import { DesktopScreenHeader } from "@/components/layout/DesktopScreenHeader"
import { SidebarSearch } from "@/components/layout/Sidebar"
import { assets } from "@/lib/assets"
import { useProfessionals, type ProfessionalSort } from "./useProfessionals"
import { ProfessionalCategories } from "./ProfessionalCategories"
import { ProfessionalFilters } from "./ProfessionalFilters"
import { ActiveFiltersRow } from "./ActiveFiltersRow"
import { ProfessionalResults } from "./ProfessionalResults"
import { SORT_OPTIONS } from "./filterOptions"
import { PROFESSIONALS } from "@/data/professionals"

type ProfessionalsScreenProps = {
  onBack: () => void
  /** Lifted to App.tsx via `useProfessionalFavorites` (not local state here
   * anymore) so "אזור אישי" can show the exact same favorited professionals
   * under "בעלי מקצוע מועדפים" — one shared Set, not a second copy that
   * could drift out of sync. */
  favorites: Set<string>
  onToggleFavorite: (id: string) => void
}

/**
 * בעלי מקצוע — a directory of pregnancy/postpartum professionals, following
 * the same screen anatomy as Baby Gear / Leaving: a mobile hero (category
 * illustration + back button) and a compact DesktopScreenHeader on desktop,
 * both using the same image at the same size as every other category — one
 * Section-less flow of category → search → filters → results shared by both
 * breakpoints. Category/search/filters/sort stay local to this screen
 * (nothing else needs them); favorites come in as props (see above).
 */
export function ProfessionalsScreen({ onBack, favorites, onToggleFavorite: toggleFavorite }: ProfessionalsScreenProps) {
  const { category, setCategory, search, setSearch, filters, setFilters, sort, setSort, results } = useProfessionals()

  const categoryResults = PROFESSIONALS.filter((p) => p.category === category)

  return (
    <div className="px-1 pb-6 pt-2 sm:px-0" dir="rtl">
      {/* Mobile hero */}
      <div className="sm:hidden">
        <button
          type="button"
          onClick={onBack}
          className="mb-2 flex items-center gap-1 self-end text-[14px] font-medium text-[#6f1e35]"
        >
          ← חזרה
        </button>

        <div className="flex flex-col items-center pb-2 pt-1 text-center">
          <img src={assets.homeProfessionals} alt="" aria-hidden className="mb-1 h-28 w-28 object-contain" />
          <h1 className="text-[26px] font-black leading-[34px] text-[#6f1e35]">בעלי מקצוע</h1>
          <p className="mt-1 text-[14px] leading-[22px] text-[#544245]">
            אנשים שיכולים לעזור לך בתקופת ההריון, הלידה והחודשים הראשונים
          </p>
        </div>
      </div>

      {/* Desktop header — same DesktopScreenHeader component Bag/Gear/
          Leaving use, with the same image at the same h-14 w-14 size. */}
      <div className="hidden sm:block">
        <DesktopScreenHeader
          image={assets.homeProfessionals}
          title="בעלי מקצוע"
          subtitle="אנשים שיכולים לעזור לך בתקופת ההריון, הלידה והחודשים הראשונים"
        />
      </div>

      <div className="mt-4 flex flex-col gap-4">
        <ProfessionalCategories value={category} onChange={setCategory} />

        <SidebarSearch
          placeholder="חיפוש לפי שם או אזור"
          query={search}
          onSearch={setSearch}
          onClear={() => setSearch("")}
        />

        <ProfessionalFilters category={category} value={filters} onChange={setFilters} categoryResults={categoryResults} />
        <ActiveFiltersRow category={category} value={filters} onChange={setFilters} />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[15px] font-medium text-[#544245] sm:text-body-sm sm:text-content-secondary">
            נמצאו {results.length} בעלי מקצוע
          </p>
          <label className="flex items-center gap-1.5 text-[15px] font-medium text-[#6f1e35] sm:text-caption sm:font-normal sm:text-content-muted">
            מיון:
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as ProfessionalSort)}
              className="rounded-md border-0 bg-transparent px-1 py-1 text-[15px] font-medium text-[#6f1e35] sm:border sm:border-border sm:bg-surface sm:px-2 sm:text-caption sm:text-content-primary"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <ProfessionalResults results={results} favorites={favorites} onToggleFavorite={toggleFavorite} />
      </div>
    </div>
  )
}
