import { assets } from "@/lib/assets"

type HomeCard = {
  key: string
  img: string
  title: string
  onNavigate?: () => void
}

type HomeScreenProps = {
  onNavigateToNames: () => void
  onNavigateToProfessionals: () => void
  onNavigateToGear: () => void
  onNavigateToLeaving: () => void
  onNavigateToPersonal: () => void
}

/**
 * The app's home screen: a brand-introduction hero (heading, subtitle, the
 * cheerful brain mascot) plus a 2×2 grid of category cards — no greeting,
 * no extra sections, per the redesign brief. See DESIGN_GUIDE.md for the
 * full token reference this and future screens should draw from.
 *
 * "הכנת תיק לידה" no longer has a card of its own here — it merged into
 * "ציוד לתינוק" as a category (see BabyGearScreen.tsx), so this slot in the
 * 2×2 grid now opens "בעלי מקצוע" instead.
 */
export function HomeScreen({
  onNavigateToNames,
  onNavigateToProfessionals,
  onNavigateToGear,
  onNavigateToLeaving,
  onNavigateToPersonal,
}: HomeScreenProps) {
  const cards: HomeCard[] = [
    { key: "professionals", img: assets.homeProfessionals, title: "בעלי מקצוע", onNavigate: onNavigateToProfessionals },
    { key: "names", img: assets.homeNames, title: "בחירת שם", onNavigate: onNavigateToNames },
    { key: "gear", img: assets.homeBabyGear, title: "ציוד לתינוק", onNavigate: onNavigateToGear },
    { key: "leaving", img: assets.homeLeaving, title: "לפני שיוצאים", onNavigate: onNavigateToLeaving },
  ]

  return (
    <div className="px-1 pb-3 pt-2" dir="rtl">
      {/* hero — brand introduction, not a dashboard status line: no
          greeting, the mascot as the visual anchor. Spacing kept tight on
          purpose so header + hero + all four cards fit one screen without
          scrolling. */}
      <div className="flex flex-col items-center px-4 pb-1 pt-2 text-center">
        <img
          src={assets.heroWordmark}
          alt="טפשת — המוח בהולד? אנחנו פה לעזור"
          className="h-[74px] w-[296px] max-w-full object-contain"
        />

        <img
          src={assets.brainMascotCheerful}
          alt=""
          aria-hidden
          className="mt-2 h-[150px] w-[150px] object-contain"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {cards.map((card) => (
          <button
            key={card.key}
            type="button"
            onClick={card.onNavigate}
            // Empty touch handler — iOS Safari otherwise never applies
            // `:active` styles to a tapped element unless something is
            // listening for a touch event on it, so without this the press
            // effect below silently never showed up on iPhone.
            onTouchStart={() => {}}
            disabled={!card.onNavigate}
            className="flex min-h-[168px] flex-col items-center justify-center gap-1 rounded-[28px] bg-white p-4 text-center shadow-[0px_1px_1px_rgba(0,0,0,0.05)] transition-transform duration-100 active:scale-[0.96] active:bg-[#fff0f2] disabled:active:scale-100 disabled:active:bg-white"
          >
            <img src={card.img} alt="" aria-hidden className="mb-1 h-14 w-14 object-contain" />
            <p className="text-[17px] font-bold leading-[23px] text-[#6f1e35]">{card.title}</p>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onNavigateToPersonal}
        onTouchStart={() => {}}
        className="mt-4 flex h-14 w-full items-center justify-center rounded-full bg-[#6f1e35] text-[17px] font-bold text-white transition-transform duration-100 active:scale-[0.98]"
      >
        אזור אישי
      </button>
    </div>
  )
}
