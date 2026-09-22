import { useCallback, useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { DesktopScreenHeader } from "@/components/layout/DesktopScreenHeader"
import { Section } from "@/components/layout/Section"
import { SidebarSearch } from "@/components/layout/Sidebar"
import { EmptyState } from "@/components/ui/EmptyState"
import { Modal } from "@/components/ui/Modal"
import { Button } from "@/components/ui/Button"
import { LoginScreen } from "@/features/auth/LoginScreen"
import { GuestNameOnboarding } from "@/features/auth/GuestNameOnboarding"
import { useSession } from "@/features/auth/useSession"
import {
  canUpgradeAccount,
  displayNameFor,
  isGuest,
  providerAvatarUrl,
} from "@/features/auth/profile"
import {
  beginAccountLink,
  consumeAccountLinkOutcome,
  type LinkResult,
} from "@/features/auth/linkAccount"
import { assets } from "@/lib/assets"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { ListMagnifyingGlass, Basket, CarSimple, UsersThree, BookmarkSimple } from "@phosphor-icons/react"
import type { MobileCategoryItem } from "@/components/layout/MobileNav"

import { useNames } from "@/features/names/useNames"
import { NameGrid } from "@/features/names/NameGrid"
import { NameFiltersBar, EMPTY_NAME_FILTERS, type NameFiltersValue } from "@/features/names/NameFiltersBar"
import { ActiveFiltersRow } from "@/features/names/ActiveFiltersRow"
import { logSearch } from "@/data/searchLogs"
import { logFilterClick } from "@/data/filterClickLogs"
import { useSilentRetry } from "@/lib/useSilentRetry"
import { HomeScreen } from "@/features/home/HomeScreen"
import { BabyGearScreen } from "@/features/babyGear/BabyGearScreen"
import { LeavingScreen } from "@/features/leaving/LeavingScreen"
import { ProfessionalsScreen } from "@/features/professionals/ProfessionalsScreen"
import { useProfessionalFavorites } from "@/features/professionals/useProfessionals"
import { PersonalAreaScreen } from "@/features/personalArea/PersonalAreaScreen"
import { useSavedItemSet } from "@/lib/useSavedItemSet"
import { ROUTE_FOR_VIEW, viewForPathname, type MobileView } from "@/lib/screenRoutes"
import { useIsDesktop } from "@/lib/useIsDesktop"
import { cn } from "@/lib/cn"

const PRODUCT_NAME = "טפשת"
const TAGLINE = "עוזרים לך לזכור את מה שחשוב"
const PRIVACY_NOTE = "השמות שאתם שומרים גלויים רק לכם."

// Desktop sidebar navigation: one flat list of the product's functional
// areas, names included as just another item rather than a visually split-
// off group — no divider, no "settings" row (there is no settings screen to
// send it to), and no "home" row (desktop has no Home screen; see the
// redirect effect below). Same icons as the mobile drawer's own categories,
// so desktop and mobile read as the same navigation, just laid out
// differently.
//
// "הכנת תיק לידה" no longer has its own row — it's a category inside
// "ציוד לתינוק" now (see BabyGearScreen.tsx), so this list has one fewer
// item than it used to.
//
// "אזור אישי" sits at the top, above every functional area — a dashboard of
// what the person has already saved, rather than one more product area
// alongside them.
const NAV_GROUPS = [
  [
    { id: "personal", label: "אזור אישי", icon: BookmarkSimple },
    { id: "gear", label: "ציוד לתינוק", icon: Basket },
    { id: "leaving", label: "לפני שיוצאים", icon: CarSimple },
    { id: "browse", label: "בחירת שם", icon: ListMagnifyingGlass },
    { id: "professionals", label: "בעלי מקצוע", icon: UsersThree },
  ],
]

export default function App() {
  const { session, loading: sessionLoading, profileLoading, displayName, setDisplayName } = useSession()
  const [searchQuery, setSearchQuery] = useState("")
  // Mobile-only: which screen is showing. Desktop always shows the name
  // catalogue regardless of this — see the render below, guarded by sm:.
  // Driven by the real URL (browser history is the source of truth — see
  // src/lib/screenRoutes.ts) rather than local state, so the physical/
  // browser Back button steps through the actual screens the person
  // visited, in the order they visited them.
  const location = useLocation()
  const navigate = useNavigate()
  const mobileView = viewForPathname(location.pathname)
  const setMobileView = useCallback(
    (view: MobileView) => {
      const target = ROUTE_FOR_VIEW[view]
      // Guard against pushing a duplicate entry for the screen already showing.
      if (target !== location.pathname) navigate(target)
    },
    [location.pathname, navigate],
  )

  // Mobile hamburger drawer content — the same categories as the Home
  // screen's own cards, so the drawer reads as "everywhere I can go", not a
  // second, different navigation scheme. "הכנת תיק לידה" has no row of its
  // own here any more — it's a category inside "ציוד לתינוק" (see
  // BabyGearScreen.tsx), which is where its drawer entry now points.
  // "אזור אישי" sits first, same as the desktop sidebar's NAV_GROUPS above.
  const mobileCategories: MobileCategoryItem[] = [
    {
      id: "personal",
      label: "אזור אישי",
      icon: BookmarkSimple,
      onSelect: () => setMobileView("personal"),
    },
    {
      id: "browse",
      label: "בחירת שם",
      icon: ListMagnifyingGlass,
      onSelect: () => setMobileView("browse"),
    },
    {
      id: "gear",
      label: "ציוד לתינוק",
      icon: Basket,
      onSelect: () => setMobileView("gear"),
    },
    {
      id: "leaving",
      label: "לפני שיוצאים",
      icon: CarSimple,
      onSelect: () => setMobileView("leaving"),
    },
    {
      id: "professionals",
      label: "בעלי מקצוע",
      icon: UsersThree,
      onSelect: () => setMobileView("professionals"),
    },
  ]

  // Desktop has no Home screen — it's a workspace the person lands directly
  // inside a functional area of, per the desktop-layout brief. Mirrors the
  // same four early-return gates below (Supabase configured, session
  // resolved, guest profile loaded, guest has chosen a name) so this never
  // fires while one of those screens — not the dashboard — is what's
  // actually showing.
  const isDesktop = useIsDesktop()
  const readyForDashboard =
    isSupabaseConfigured &&
    !sessionLoading &&
    !(session && isGuest(session.user) && profileLoading) &&
    Boolean(session) &&
    !(session && isGuest(session.user) && displayName === null)

  useEffect(() => {
    if (!readyForDashboard || !isDesktop || mobileView !== "home") return
    navigate(ROUTE_FOR_VIEW.gear, { replace: true })
  }, [readyForDashboard, isDesktop, mobileView, navigate])

  const [filters, setFilters] = useState<NameFiltersValue>(EMPTY_NAME_FILTERS)
  const [sort, setSort] = useState<"alphabetical" | "popularity">("alphabetical")
  const [linkResult, setLinkResult] = useState<LinkResult | null>(null)
  const [confirmGuestSignOut, setConfirmGuestSignOut] = useState(false)

  const providerAvatar = session ? providerAvatarUrl(session.user) : null

  useEffect(() => {
    consumeAccountLinkOutcome()
      .then((result) => {
        if (result && result.outcome !== "cancelled") setLinkResult(result)
      })
      .catch(() => {})
  }, [])

  const startAccountLink = useCallback(async () => {
    const failure = await beginAccountLink()
    if (failure) setLinkResult({ outcome: "failed", detail: failure })
  }, [])

  const userId = session?.user.id

  // Lifted out of BabyGearScreen/LeavingScreen/ProfessionalsScreen (which
  // used to each own this as local state) so "אזור אישי" reads and writes
  // the exact same checked-items/favorites state those screens use — one
  // shared source of truth per collection, not a second copy that could
  // drift out of sync. Names already work this way via `useNames` below
  // (its `favorites` Map is this same kind of App-level shared state).
  // Persisted per-user to gear_checklist/leaving_checklist/
  // professional_favorites (see src/lib/useSavedItemSet.ts) so selections
  // survive a page refresh instead of resetting.
  const { items: gearChecked, toggle: toggleGear } = useSavedItemSet(
    { table: "gear_checklist", itemColumn: "item_id" },
    userId,
  )

  const { items: leavingChecked, toggle: toggleLeaving } = useSavedItemSet(
    { table: "leaving_checklist", itemColumn: "item_id" },
    userId,
  )

  const { favorites: professionalFavorites, toggleFavorite: toggleProfessionalFavorite } =
    useProfessionalFavorites(userId)

  // Logged after a short pause in typing, not on every keystroke — the
  // actual search itself stays instant either way, this only debounces
  // what gets written to search_logs.
  useEffect(() => {
    const trimmed = searchQuery.trim()
    if (!userId || trimmed.length < 2) return
    const id = window.setTimeout(() => {
      void logSearch(trimmed, userId)
    }, 600)
    return () => window.clearTimeout(id)
  }, [searchQuery, userId])

  const {
    names,
    favorites,
    loading: namesLoading,
    error: namesError,
    reload: reloadNames,
    toggleFavorite,
  } = useNames(userId, {
    search: searchQuery || undefined,
    sort,
    gender: filters.gender,
    origins: filters.origins,
    meanings: filters.meanings,
    styles: filters.styles,
    popularities: filters.popularities,
    initial: filters.more.initial,
    endsWith: filters.more.endsWith,
    short: filters.more.short,
    easyInEnglish: filters.more.easyInEnglish,
    worksInternationally: filters.more.worksInternationally,
  })

  useSilentRetry(namesError, reloadNames)

  if (!isSupabaseConfigured) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-bg px-4">
        <div className="w-full max-w-[480px]">
          <EmptyState
            title="החיבור ל-Supabase לא מוגדר"
            description="חסרים המשתנים VITE_SUPABASE_URL ו-VITE_SUPABASE_ANON_KEY. ראו את קובץ README."
          />
        </div>
      </main>
    )
  }

  if (sessionLoading || (session && isGuest(session.user) && profileLoading)) {
    return (
      <main
        aria-busy="true"
        className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-4"
      >
        <img
          src={assets.brainMascotCheerful}
          alt=""
          aria-hidden
          width={96}
          height={96}
          className="size-24 animate-pulse rounded-full bg-surface-secondary object-cover"
        />
        <p className="text-body text-content-secondary">טוען…</p>
      </main>
    )
  }

  if (!session) {
    return (
      <LoginScreen
        brandName={PRODUCT_NAME}
        brandTagline={TAGLINE}
        privacyNote={PRIVACY_NOTE}
      />
    )
  }

  // A brand-new guest has a session but no display_name yet — asked for
  // directly, once, rather than ever auto-generated. Returning guests keep
  // whatever they chose the first time (see profile.ts), so this only ever
  // shows once per guest identity. The profileLoading check above already
  // ruled out "still fetching" as the reason displayName is null here.
  if (isGuest(session.user) && displayName === null) {
    return (
      <GuestNameOnboarding
        brandName={PRODUCT_NAME}
        userId={session.user.id}
        onChosen={setDisplayName}
      />
    )
  }

  const userName = displayName ?? displayNameFor(session.user)
  // Every anonymous/guest session (no linked Google login) shows the same
  // fixed brain-mascot illustration instead of a per-user generated avatar.
  const avatarUrl = providerAvatar ?? (isGuest(session.user) ? assets.guestAvatar : assets.heroIllustration)

  return (
    <>
      <DashboardLayout
        brandName={PRODUCT_NAME}
        navGroups={NAV_GROUPS}
        activeNavId={mobileView}
        mobileCategories={mobileCategories}
        activeMobileCategoryId={mobileView}
        userName={userName}
        avatarUrl={avatarUrl}
        canUpgrade={canUpgradeAccount(session.user)}
        onSelectNav={(id) => setMobileView(id as MobileView)}
        onUpgrade={startAccountLink}
        onSignOut={() => {
          if (canUpgradeAccount(session.user)) setConfirmGuestSignOut(true)
          else void supabase.auth.signOut()
        }}
      >
        {/* All five screens always mounted (never conditionally rendered to
            null) so each keeps its own state — a checked checklist item, an
            expanded accordion category, an active filter — when the person
            navigates away and back. Visibility toggles per screen:
              - Home has no desktop version at all (desktop redirects away
                from it — see the effect above), so it alone is hidden at
                sm: and up whenever it's the active route.
              - Gear/Leaving/Browse/Professionals each handle their own
                mobile-vs-desktop split internally (an inner "sm:hidden"
                block for the mobile JSX, "hidden sm:block" for the desktop
                JSX), so their outer wrapper here must show on EVERY
                breakpoint when active — using "sm:hidden" here like Home
                would hide the desktop JSX too and leave the content area
                blank above the mobile breakpoint.
            Every non-active screen stays plain "hidden" at every breakpoint,
            not unmounted, until it becomes the active route again.
            "הכנת תיק לידה" is no longer one of these screens — it merged
            into "ציוד לתינוק" as a category (see BabyGearScreen.tsx), so
            Home's own card in that grid slot now opens "בעלי מקצוע"
            instead. */}
        <div className={cn(mobileView === "home" ? "sm:hidden" : "hidden")}>
          <HomeScreen
            onNavigateToNames={() => setMobileView("browse")}
            onNavigateToProfessionals={() => setMobileView("professionals")}
            onNavigateToGear={() => setMobileView("gear")}
            onNavigateToLeaving={() => setMobileView("leaving")}
            onNavigateToPersonal={() => setMobileView("personal")}
          />
        </div>

        <div className={cn(mobileView === "gear" ? undefined : "hidden")}>
          <BabyGearScreen checked={gearChecked} onToggle={toggleGear} />
        </div>

        <div className={cn(mobileView === "leaving" ? undefined : "hidden")}>
          <LeavingScreen checked={leavingChecked} onToggle={toggleLeaving} />
        </div>

        <div className={cn(mobileView === "professionals" ? undefined : "hidden")}>
          <ProfessionalsScreen favorites={professionalFavorites} onToggleFavorite={toggleProfessionalFavorite} />
        </div>

        {/* Reachable from the mobile Home screen's "אזור אישי" button now too
            (see HomeScreen.tsx), so — like Gear/Leaving/Browse/Professionals
            — this must stay visible at every breakpoint when active. Every
            prop here is the exact same state instance the screens above
            read/write — see the lifted-state block up top. */}
        <div className={cn(mobileView === "personal" ? undefined : "hidden")}>
          <PersonalAreaScreen
            names={names}
            nameFavorites={favorites}
            onToggleNameFavorite={toggleFavorite}
            gearChecked={gearChecked}
            onToggleGear={toggleGear}
            leavingChecked={leavingChecked}
            onToggleLeaving={toggleLeaving}
            professionalFavorites={professionalFavorites}
            onToggleProfessionalFavorite={toggleProfessionalFavorite}
          />
        </div>

        {/* The existing name catalogue — its own content byte-for-byte
            unchanged. Now visible (mobile or desktop) only when "browse" is
            the active route, like every other screen, rather than always
            showing on desktop regardless of navigation. Header follows the
            same mobile-hero / desktop-DesktopScreenHeader convention as
            Bag/Gear/Leaving (Section's own generic header is no longer used
            here) so this screen reads as one more workspace area rather
            than a visually different, older part of the product. */}
        <div className={cn(mobileView === "browse" ? undefined : "hidden")}>
          <Section>
            <div className="flex flex-col gap-4">
              {/* No "← חזרה" link any more (removed everywhere per the
                  request); navigation back to Home is via the sidebar/
                  drawer only. */}
              <div className="sm:hidden">
                <div className="flex flex-col items-center pb-2 pt-1 text-center">
                  <img src={assets.homeNames} alt="" aria-hidden className="mb-1 h-28 w-28 object-contain" />
                  <h1 className="text-[26px] font-black leading-[34px] text-[#6f1e35]">בחירת שם</h1>
                  <p className="mt-1 text-[14px] leading-[22px] text-[#544245]">
                    עיינו, חפשו וסננו מתוך הקטלוג המשותף של טפשת, ושמרו את השמות שאהבתם.
                  </p>
                </div>
              </div>

              <div className="hidden sm:block">
                <DesktopScreenHeader
                  image={assets.homeNames}
                  title="כל השמות"
                  subtitle="עיינו, חפשו וסננו מתוך הקטלוג המשותף של טפשת, ושמרו את השמות שאהבתם."
                />
              </div>

              {/* Search used to live in the sidebar, where it was the only
                  control that applied to just this one screen — now it lives
                  here instead, right alongside the filters it works with. */}
              <SidebarSearch
                placeholder="חיפוש שם"
                query={searchQuery}
                onSearch={setSearchQuery}
                onClear={() => setSearchQuery("")}
              />

              <NameFiltersBar
              value={filters}
              onChange={setFilters}
              onFilterClick={(category, value, selected) => {
                if (userId) void logFilterClick(userId, category, value, selected)
              }}
            />
            <ActiveFiltersRow value={filters} onChange={setFilters} />

            {!namesLoading && !namesError ? (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[15px] font-medium text-[#544245] sm:text-body-sm sm:text-content-secondary">
                  {names.length} שמות נמצאו
                </p>
                <label className="flex items-center gap-1.5 text-[15px] font-medium text-[#6f1e35] sm:text-caption sm:font-normal sm:text-content-muted">
                  מיון:
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as "alphabetical" | "popularity")}
                    className="rounded-md border-0 bg-transparent px-1 py-1 text-[15px] font-medium text-[#6f1e35] sm:border sm:border-border sm:bg-surface sm:px-2 sm:text-caption sm:text-content-primary"
                  >
                    <option value="alphabetical">לפי א-ב</option>
                    <option value="popularity">לפי פופולריות</option>
                  </select>
                </label>
              </div>
            ) : null}

            <NameGrid
              names={names}
              favorites={favorites}
              loading={namesLoading}
              error={namesError}
              searchQuery={searchQuery}
              onToggleFavorite={toggleFavorite}
            />
            </div>
          </Section>
        </div>
      </DashboardLayout>

      <Modal
        open={confirmGuestSignOut}
        onClose={() => setConfirmGuestSignOut(false)}
        title="לצאת מחשבון האורח?"
        footer={
          <>
            <Button
              variant="ghost"
              size="md"
              onClick={() => setConfirmGuestSignOut(false)}
            >
              ביטול
            </Button>
            <Button
              variant="destructive"
              size="md"
              onClick={() => {
                setConfirmGuestSignOut(false)
                void supabase.auth.signOut()
              }}
            >
              צא בכל זאת
            </Button>
          </>
        }
      >
        <p className="text-body text-content-secondary">
          חשבון האורח קיים רק בדפדפן הזה. אם תצאו, לא נוכל לשחזר אותו — והשמות
          ששמרתם לא יהיו נגישים יותר.
        </p>
        <p className="text-body-sm text-content-muted">
          כדי לשמור אותם, סגרו את החלון ובחרו "כניסה עם Google" בתפריט החשבון.
        </p>
      </Modal>

      <Modal
        open={linkResult !== null}
        onClose={() => setLinkResult(null)}
        title={
          linkResult?.outcome === "linked"
            ? "החשבון נשמר 🎉"
            : "שמירת החשבון לא הושלמה"
        }
        footer={
          <Button
            variant="primary"
            size="md"
            onClick={() => setLinkResult(null)}
          >
            סגירה
          </Button>
        }
      >
        <p className="text-body text-content-secondary">
          {linkResult?.outcome === "linked"
            ? "השמות ששמרתם איתכם גם בפעם הבאה."
            : linkResult?.outcome === "conflict"
              ? "חשבון Google הזה כבר משויך למשתמש אחר. התחברו איתו ישירות, או נסו חשבון Google אחר. הנתונים שלכם כאן לא נפגעו."
              : "לא הצלחנו לשמור את החשבון, ונשארתם מחוברים כאורח. שום דבר לא אבד — אפשר לנסות שוב."}
        </p>
        {linkResult?.detail && linkResult.outcome !== "linked" ? (
          <p dir="ltr" className="text-caption text-content-muted">
            {linkResult.detail}
          </p>
        ) : null}
      </Modal>
    </>
  )
}
