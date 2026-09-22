import { AccordionItem } from "@/components/ui/Accordion"
import { ChecklistCategoryCard } from "@/components/ui/ChecklistCategoryCard"
import { ChecklistCategoryGrid } from "@/components/ui/ChecklistCategoryGrid"
import { ChecklistItemList } from "@/components/ui/ChecklistItemList"
import { DesktopScreenHeader } from "@/components/layout/DesktopScreenHeader"
import { assets } from "@/lib/assets"
import { Icon as PhosphorIcon } from "@/components/ui/PhosphorIcon"
import { Lightbulb } from "@phosphor-icons/react"
import { GEAR_CATEGORIES as CATEGORIES } from "@/data/babyGear"

type BabyGearScreenProps = {
  /** Lifted to App.tsx (not local state here anymore) so "אזור אישי" can
   * show the exact same checked items under "ציוד שנבחר" — one shared Set,
   * not a second copy that could drift out of sync. */
  checked: Set<string>
  onToggle: (id: string) => void
}

export function BabyGearScreen({ checked, onToggle: toggle }: BabyGearScreenProps) {
  const totalItems = CATEGORIES.reduce((sum, c) => sum + c.items.length, 0)
  const totalDone = CATEGORIES.reduce((sum, c) => sum + c.items.filter((i) => checked.has(i.id)).length, 0)

  return (
    <div className="px-1 pb-6 pt-2 sm:px-0" dir="rtl">
      {/* Mobile — same hero, title and page picture as before (no "← חזרה"
          link any more — navigation back to Home is via the sidebar/drawer
          only now, per the request to remove that link everywhere). */}
      <div className="sm:hidden">
        <div className="flex flex-col items-center pb-2 pt-1 text-center">
          <img src={assets.homeBabyGear} alt="" aria-hidden className="mb-1 h-28 w-28 object-contain" />
          <h1 className="text-[26px] font-black leading-[34px] text-[#6f1e35]">ציוד לתינוק</h1>
          <p className="mt-1 text-[14px] leading-[22px] text-[#544245]">כל מה שצריך להכין לקראת הגעת הבייבי</p>
        </div>

        <div className="mt-4 flex flex-col gap-2.5">
          {CATEGORIES.map((category) => {
            const doneCount = category.items.filter((i) => checked.has(i.id)).length
            const total = category.items.length
            const hasProgress = doneCount > 0
            return (
              <AccordionItem
                key={category.id}
                icon={<PhosphorIcon icon={category.icon} size={22} weight="duotone" color="#6f1e35" />}
                title={category.title}
                subtitle={category.subtitle}
                defaultOpen={category.id === "hospitalBag"}
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
      </div>

      {/* Desktop: compact header + every category open as its own card in a
          grid — checklist categories are not collapsed on desktop, per the
          workspace-layout brief. */}
      <div className="hidden sm:block">
        <DesktopScreenHeader
          image={assets.homeBabyGear}
          title="ציוד לתינוק"
          subtitle="כל מה שצריך להכין לקראת הגעת הבייבי"
          progressLabel={`הושלמו ${totalDone} מתוך ${totalItems}`}
        />

        <div className="mt-4">
          <ChecklistCategoryGrid>
            {CATEGORIES.map((category) => (
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
      </div>

      <div className="mx-1 mt-4 flex items-start gap-3 rounded-xl bg-[rgba(255,218,214,0.3)] p-3.5 sm:mx-0 sm:max-w-[1200px]">
        <span aria-hidden className="mt-0.5 shrink-0">
          <PhosphorIcon icon={Lightbulb} size={16} weight="duotone" color="#6f1e35" />
        </span>
        <p className="text-right text-[12px] leading-[16.5px] text-[#1d1b19] sm:text-[14px] sm:leading-5">
          <span className="font-bold">טיפ: </span>
          <span className="font-normal">לא חייבים להשיג הכל ביום אחד. קחו נשימה עמוקה, סמנו מה שיש, ואתם מוכנים להמשיך!</span>
        </p>
      </div>
    </div>
  )
}
