import type { ReactNode } from "react"
import type { Icon as PhosphorIconComponent } from "@phosphor-icons/react"
import { DesktopScreenHeader } from "@/components/layout/DesktopScreenHeader"
import { EmptyState } from "@/components/ui/EmptyState"
import { Icon as PhosphorIcon } from "@/components/ui/PhosphorIcon"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/cn"
import { DonutChart, type DonutSegment } from "@/components/ui/DonutChart"
import { CategoryBarChart, type CategoryBar } from "@/components/ui/CategoryBarChart"
import { assets } from "@/lib/assets"
import { rampAt, rampStep } from "@/lib/colorRamp"
import { GEAR_CATEGORIES } from "@/data/babyGear"
import { LEAVING_CATEGORIES } from "@/data/leaving"
import { PROFESSIONALS, type ProfessionalCategory } from "@/data/professionals"
import { CATEGORY_TABS, CATEGORY_LABELS } from "@/features/professionals/filterOptions"
import type { NameCardData } from "@/features/names/NameCard"
import {
  Heart,
  Basket,
  UsersThree,
  WhatsappLogo,
  X,
  ChartBar,
  Star,
  Drop,
  MoonStars,
  HandHeart,
  CaretLeft,
} from "@phosphor-icons/react"

/** One icon per בעלי מקצוע category, for the "בעלי מקצוע מומלצים" card —
 * this codebase has no existing category→icon map (ProfessionalCategories
 * only needed labels until now), so this is a new, small, local one. */
const PROFESSIONAL_CATEGORY_ICON: Record<ProfessionalCategory, PhosphorIconComponent> = {
  mohel: Star,
  lactation: Drop,
  sleep: MoonStars,
  doula: HandHeart,
}

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
  /** Desktop-only "בעלי מקצוע מומלצים" card: each category row is
   * clickable and takes the person to בעלי מקצוע, same as the sidebar/
   * drawer entry — reuses the app's existing navigation rather than
   * introducing a second way to get there. */
  onNavigateToProfessionals: () => void
}

type Chip = { key: string; label: string; onRemove: () => void }

/** One removable saved item — the same pill/× convention the Leaving/
 * Professionals filter-chip rows already use, so "this is something you
 * chose and can undo" reads consistently across the app. */
function RemovableChip({ chip }: { chip: Chip }) {
  return (
    <span className="flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-[#f3ede8] ps-1 pe-3 text-[16px] font-medium text-[#1d1b19]">
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
  /** The two chart cards (bar + donut) ask for their content vertically
   * centered so they read as equal visual counterparts regardless of
   * chart shape; every other card here is a wrapping chip/row list that
   * should stay top-aligned as before, so this defaults to off. */
  centerContent = false,
  children,
}: {
  icon: ReactNode
  title: string
  count: number
  centerContent?: boolean
  children: ReactNode
}) {
  return (
    <div className="flex h-full flex-col gap-3 rounded-xl border border-[#f0e8e0] bg-white p-4 shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span aria-hidden className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[rgba(255,217,222,0.4)]">
            {icon}
          </span>
          <span className="text-[20px] font-bold leading-7 text-[#1d1b19]">{title}</span>
        </div>
        <span className="shrink-0 rounded-full bg-[#f3ede8] px-2.5 py-1 text-[16px] font-medium leading-5 text-[#544245]">
          {count}
        </span>
      </div>

      <div
        className={cn(
          "border-t border-[#f0e8e0] pt-3",
          centerContent && "flex flex-1 flex-col justify-center",
        )}
      >
        {children}
      </div>
    </div>
  )
}

type LeavingGroup = { id: string; title: string; items: { id: string; label: string }[] }
type GearGroup = { id: string; title: string; items: { id: string; label: string }[] }

/** Just the fields the share message shows per professional — a subset of
 * `Professional`, so this stays decoupled from the rest of that type. */
type ProfessionalShareDetails = {
  name: string
  title?: string
  areaLabel?: string
  phone?: string
}

/** One professional's block in the share message: name on its own line,
 * then only the details that actually exist for them (never a placeholder
 * for a missing one) — same "don't invent data" rule as the rest of the
 * app's real-data-only content. */
function formatProfessionalForShare(p: ProfessionalShareDetails): string {
  const lines = [`• ${p.name}`]
  if (p.title) lines.push(`  ${p.title}`)
  if (p.areaLabel) lines.push(`  📍 ${p.areaLabel}`)
  if (p.phone) lines.push(`  📞 ${p.phone}`)
  return lines.join("\n")
}

/**
 * Turns whatever's currently in "אזור אישי" into one clean, readable Hebrew
 * message for the "שלחי את הרשימה בוואטסאפ" share action below — the exact
 * same section titles the cards on screen use, so the shared text and the
 * page never say two different things for the same list. A section with
 * nothing in it is left out entirely, same as it is on screen.
 */
function buildWhatsAppShareText(
  leavingGroups: LeavingGroup[],
  gearGroups: GearGroup[],
  favoriteProfessionals: ProfessionalShareDetails[],
  favoriteNames: Chip[],
): string {
  const sections: string[] = []

  if (leavingGroups.length > 0) {
    const items = leavingGroups.flatMap((group) => group.items.map((item) => `• ${item.label}`))
    sections.push(["♡ דברים שצריך לעשות לפני יציאה", ...items].join("\n"))
  }

  if (gearGroups.length > 0) {
    const items = gearGroups.flatMap((group) => group.items.map((item) => `• ${item.label}`))
    sections.push(["🛒 ציוד שנבחר", ...items].join("\n"))
  }

  if (favoriteProfessionals.length > 0) {
    const entries = favoriteProfessionals.map(formatProfessionalForShare)
    sections.push(`👩‍⚕️ בעלי מקצוע מועדפים\n\n${entries.join("\n\n")}`)
  }

  if (favoriteNames.length > 0) {
    const items = favoriteNames.map((chip) => `• ${chip.label}`)
    sections.push(["💗 שמות מועדפים", ...items].join("\n"))
  }

  return ["הדברים שלי בטפשת 💗", "", ...sections].join("\n\n")
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
  onNavigateToProfessionals,
}: PersonalAreaScreenProps) {
  // ---- דברים שצריך לעשות לפני יציאה — checked "לפני שיוצאים" items,
  // grouped by their original checklist sub-category (same pattern as the
  // gear section below), so e.g. "רכב ונסיעה" vs "מסמכים וחפצים חשובים"
  // stays visible instead of one flat pool of items. --------------------
  const leavingGroups = LEAVING_CATEGORIES.map((category) => ({
    id: category.id,
    title: category.title,
    icon: category.icon,
    items: category.items.filter((item) => leavingChecked.has(item.id)),
  })).filter((group) => group.items.length > 0)
  const leavingCount = leavingGroups.reduce((sum, g) => sum + g.items.length, 0)

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
  const favoriteProfessionalRecords = PROFESSIONALS.filter((p) => professionalFavorites.has(p.id))
  const favoriteProfessionals: Chip[] = favoriteProfessionalRecords.map((p) => ({
    key: p.id,
    label: p.name,
    onRemove: () => onToggleProfessionalFavorite(p.id),
  }))
  // Richer than the chip above — name, profession, city and phone — for the
  // WhatsApp share text below, which shows every detail actually on file
  // for each saved professional rather than just their name.
  const favoriteProfessionalDetails: ProfessionalShareDetails[] = favoriteProfessionalRecords.map((p) => ({
    name: p.name,
    title: p.title,
    areaLabel: p.areaLabel,
    phone: p.phone,
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
    leavingGroups.length > 0 || gearGroups.length > 0 || favoriteProfessionals.length > 0 || favoriteNames.length > 0

  // ---- Desktop-only analytics cards (mobile keeps the chip-list cards
  // above, untouched) ------------------------------------------------------

  // "דברים שצריך לעשות לפני יציאה" as a donut: composition of the checked
  // items by sub-category. A slice's color is keyed to that category's
  // fixed position in LEAVING_CATEGORIES (not its position among today's
  // checked groups), so a category's color never shifts depending on which
  // other categories happen to have checked items right now.
  const leavingDonutSegments: DonutSegment[] = leavingGroups.map((group) => ({
    id: group.id,
    label: group.title,
    count: group.items.length,
    color: rampStep(
      LEAVING_CATEGORIES.findIndex((c) => c.id === group.id),
      LEAVING_CATEGORIES.length,
    ),
  }))

  // "התקדמות לפי קטגוריות" — % of each לפני יציאה sub-category's own items
  // that are checked, one bar per category (every category, not just ones
  // with progress so far — a 0% bar is meaningful here). Color follows the
  // bar's own value on the same ramp, so the highest-progress bar reads as
  // the deepest accent without singling one out by hand.
  const leavingProgressBars: CategoryBar[] = LEAVING_CATEGORIES.filter((category) => category.items.length > 0).map(
    (category) => {
      const total = category.items.length
      const done = category.items.filter((item) => leavingChecked.has(item.id)).length
      const percent = Math.round((done / total) * 100)
      return { id: category.id, label: category.title, percent, color: rampAt(percent / 100) }
    },
  )
  const showLeavingCharts = leavingGroups.length > 0

  // "בעלי מקצוע מומלצים" — the same favorited professionals as the chip
  // card above, grouped by category instead of listed flat, each row
  // clickable through to בעלי מקצוע. Fixed category order (CATEGORY_TABS),
  // categories with nothing favorited are left out.
  const professionalCategoryGroups = CATEGORY_TABS.map((tab) => ({
    category: tab.value,
    label: CATEGORY_LABELS[tab.value],
    count: favoriteProfessionalRecords.filter((p) => p.category === tab.value).length,
  })).filter((group) => group.count > 0)

  // Opens WhatsApp's own share/deep-link (wa.me) with the whole page's
  // contents pre-filled as the message — the app launches on a phone if
  // it's installed, WhatsApp Web otherwise, exactly like any other "share
  // to WhatsApp" button. Nothing to persist or send through our own
  // backend for this — it's just handing the text to WhatsApp.
  const shareToWhatsApp = () => {
    const text = buildWhatsAppShareText(leavingGroups, gearGroups, favoriteProfessionalDetails, favoriteNames)
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer")
  }

  // ---- ציוד שנבחר / שמות מועדפים — kept as their own variables so the
  // mobile chip-grid (`content`) and the desktop layout (`desktopContent`)
  // don't keep two copies of this JSX in sync by hand. שמות מועדפים still
  // renders on both; ציוד שנבחר is mobile-only as of this pass — desktop's
  // `gearCard` reference was removed to keep the dashboard to its intended
  // bar/donut/professionals/names set, per the latest refinement brief. --
  const gearCard =
    gearGroups.length > 0 ? (
      <PersonalAreaCard
        icon={<PhosphorIcon icon={Basket} size={22} weight="duotone" color="#6f1e35" />}
        title="ציוד שנבחר"
        count={gearCount}
      >
        <div className="flex flex-col gap-3">
          {gearGroups.map((group) => (
            <div key={group.id} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-[16px] font-semibold text-[#877275]">
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
    ) : null

  const namesCard =
    favoriteNames.length > 0 ? (
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
    ) : null

  // Only offered once there's actually something to send — same
  // has-anything gate the section cards below use. Desktop places this
  // compact version in the header row instead (see DesktopScreenHeader's
  // `action` prop below) — mobile has no such row, so it keeps this
  // full-width button under the content, unchanged from before.
  const shareButton = hasAnyItems ? (
    <div className="mt-4 max-w-[1200px]">
      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={shareToWhatsApp}
        iconStart={<PhosphorIcon icon={WhatsappLogo} size={20} weight="fill" color="#ffffff" />}
      >
        שלחי את הרשימה בוואטסאפ
      </Button>
    </div>
  ) : null

  const whatsAppHeaderAction = hasAnyItems ? (
    <Button
      variant="primary"
      size="md"
      onClick={shareToWhatsApp}
      // The shared Button "md" size is 15px everywhere else in the app;
      // overridden here (inline style beats a shared class regardless of
      // stylesheet order) only for this one instance, to meet this page's
      // own 16px-minimum text rule without changing every other md button.
      style={{ fontSize: 16 }}
      iconStart={<PhosphorIcon icon={WhatsappLogo} size={16} weight="fill" color="#ffffff" />}
    >
      שלח את הרשימה בוואטסאפ
    </Button>
  ) : null

  const content = hasAnyItems ? (
    <div className="mt-4 grid max-w-[1200px] grid-cols-1 gap-4 lg:grid-cols-2">
      {leavingGroups.length > 0 ? (
        <PersonalAreaCard
          icon={<PhosphorIcon icon={Heart} size={22} weight="duotone" color="#6f1e35" />}
          title="דברים שצריך לעשות לפני יציאה"
          count={leavingCount}
        >
          <div className="flex flex-col gap-3">
            {leavingGroups.map((group) => (
              <div key={group.id} className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-[16px] font-semibold text-[#877275]">
                  <PhosphorIcon icon={group.icon} size={14} weight="duotone" color="#877275" />
                  <span>{group.title}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {group.items.map((item) => (
                    <RemovableChip
                      key={item.id}
                      chip={{ key: item.id, label: item.label, onRemove: () => onToggleLeaving(item.id) }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </PersonalAreaCard>
      ) : null}

      {gearCard}

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

      {namesCard}
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

  // ---- Desktop-only layout: the leaving card becomes a donut+bar pair,
  // בעלי מקצוע becomes the grouped-by-category card, and שמות מועדפים
  // keeps its existing chip card, moved beneath — ציוד שנבחר is mobile-only
  // on this dashboard per the latest refinement pass (see note below). ----
  const desktopContent = hasAnyItems ? (
    <div className="mt-4 max-w-[1200px]">
      {showLeavingCharts ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <PersonalAreaCard
            icon={<PhosphorIcon icon={ChartBar} size={22} weight="duotone" color="#6f1e35" />}
            title="התקדמות לפי קטגוריות"
            count={leavingProgressBars.length}
            centerContent
          >
            <CategoryBarChart bars={leavingProgressBars} />
          </PersonalAreaCard>

          <PersonalAreaCard
            icon={<PhosphorIcon icon={Heart} size={22} weight="duotone" color="#6f1e35" />}
            title="דברים שצריך לעשות לפני יציאה"
            count={leavingCount}
            centerContent
          >
            <DonutChart segments={leavingDonutSegments} total={leavingCount} centerCaption="פריטים בסך הכל" />
          </PersonalAreaCard>
        </div>
      ) : null}

      {professionalCategoryGroups.length > 0 ? (
        <div className={showLeavingCharts ? "mt-4" : ""}>
          <PersonalAreaCard
            icon={<PhosphorIcon icon={UsersThree} size={22} weight="duotone" color="#6f1e35" />}
            title="בעלי מקצוע מומלצים"
            count={favoriteProfessionals.length}
          >
            {/* Each row is a fixed, compact width rather than flex-1 — with
                only one or two professionals saved so far, a growing row
                would stretch awkwardly across the whole card; this way it
                stays a deliberate, card-like chip regardless of count. */}
            <div className="flex flex-wrap gap-3">
              {professionalCategoryGroups.map((group) => (
                <button
                  key={group.category}
                  type="button"
                  onClick={onNavigateToProfessionals}
                  className="flex w-[240px] max-w-full items-center gap-3 rounded-lg border border-[#f0e8e0] bg-white px-3 py-2.5 transition-colors duration-150 hover:bg-[#fff7f5]"
                >
                  <span
                    aria-hidden
                    className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[rgba(255,217,222,0.4)]"
                  >
                    <PhosphorIcon
                      icon={PROFESSIONAL_CATEGORY_ICON[group.category]}
                      size={18}
                      weight="duotone"
                      color="#6f1e35"
                    />
                  </span>
                  <span className="min-w-0 flex-1 text-right">
                    <span className="block text-[16px] font-semibold leading-5 text-[#1d1b19]">{group.label}</span>
                    <span className="block text-[16px] leading-5 text-[#877275]">{group.count} שמורים</span>
                  </span>
                  <PhosphorIcon icon={CaretLeft} size={14} weight="bold" color="#877275" />
                </button>
              ))}
            </div>
          </PersonalAreaCard>
        </div>
      ) : null}

      {/* ציוד שנבחר is deliberately left out of the desktop dashboard per
          the latest refinement pass — mobile keeps it (see `content`
          above); the dashboard's own information architecture stays at
          bar chart / donut / recommended professionals / favorite names. */}
      {namesCard ? (
        <div
          className={`grid grid-cols-1 gap-4 lg:grid-cols-2 ${
            showLeavingCharts || professionalCategoryGroups.length > 0 ? "mt-4" : ""
          }`}
        >
          {namesCard}
        </div>
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
      {/* Mobile hero — same convention as Gear/Leaving/Professionals: the
          category illustration, title and subtitle. No "← חזרה" link any
          more (removed everywhere per the request); navigation back to Home
          is via the sidebar/drawer only. */}
      <div className="sm:hidden">
        <div className="flex flex-col items-center pb-2 pt-1 text-center">
          <img src={assets.homePersonalArea} alt="" aria-hidden className="mb-1 h-28 w-28 object-contain" />
          <h1 className="text-[26px] font-black leading-[34px] text-[#6f1e35]">אזור אישי</h1>
          <p className="mt-1 text-[16px] leading-[22px] text-[#544245]">כל מה ששמרת בטפשת במקום אחד</p>
        </div>

        {content}
        {shareButton}
      </div>

      {/* Desktop — compact header (with the compact WhatsApp action on the
          opposite side of the row from the title, per the brief) + the
          donut/bar/professionals-category layout, or the empty state. */}
      <div className="hidden sm:block">
        <DesktopScreenHeader
          image={assets.homePersonalArea}
          title="אזור אישי"
          subtitle="כל מה ששמרת בטפשת במקום אחד"
          action={whatsAppHeaderAction}
        />

        {desktopContent}
      </div>
    </div>
  )
}
