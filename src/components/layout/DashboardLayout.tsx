import { useState } from "react"
import type { ReactNode } from "react"
import { Sidebar, type NavItem } from "./Sidebar"
import { MobileNav, type MobileCategoryItem } from "./MobileNav"
import { Topbar } from "./Topbar"

type DashboardLayoutProps = {
  brandName: string
  navGroups: NavItem[][]
  activeNavId: string
  /** Mobile hamburger drawer content — the Home screen's own categories,
   * not the desktop sidebar's single "browse" item (the two intentionally
   * diverge; see MobileNav's own comment). */
  mobileCategories: MobileCategoryItem[]
  activeMobileCategoryId: string
  userName: string
  avatarUrl: string
  canUpgrade?: boolean
  onSelectNav: (id: string) => void
  onUpgrade?: () => void
  onSignOut: () => void
  children: ReactNode
}

/**
 * Application shell: fixed sidebar (inline-start, RTL-aware) holding the
 * brand, navigation and sign-out; a sticky topbar carrying account controls;
 * and a max-width content column. Search used to live in the sidebar too,
 * but moved into the name-selection screen itself — the only screen it ever
 * applied to.
 */
export function DashboardLayout({
  brandName,
  navGroups,
  activeNavId,
  mobileCategories,
  activeMobileCategoryId,
  userName,
  avatarUrl,
  canUpgrade,
  onSelectNav,
  onUpgrade,
  onSignOut,
  children,
}: DashboardLayoutProps) {
  const [navOpen, setNavOpen] = useState(false)

  return (
    <div className="min-h-screen bg-bg">
      <Sidebar
        brandName={brandName}
        groups={navGroups}
        activeId={activeNavId}
        userName={userName}
        avatarUrl={avatarUrl}
        canUpgrade={canUpgrade}
        onSelect={onSelectNav}
        onUpgrade={onUpgrade}
        onSignOut={onSignOut}
      />

      <MobileNav
        open={navOpen}
        onClose={() => setNavOpen(false)}
        categories={mobileCategories}
        activeCategoryId={activeMobileCategoryId}
        userName={userName}
        avatarUrl={avatarUrl}
        canUpgrade={canUpgrade}
        onUpgrade={onUpgrade}
        onSignOut={onSignOut}
      />

      <div className="lg:ms-[264px]">
        <Topbar
          avatarUrl={avatarUrl}
          displayName={userName}
          isGuest={Boolean(canUpgrade)}
          onLinkGoogle={() => onUpgrade?.()}
          onSignOut={onSignOut}
          onOpenNav={() => setNavOpen(true)}
        />

        <main className="mx-auto w-full max-w-[1440px] px-4 py-6 md:px-6 md:py-8 lg:px-8">
          <div className="flex flex-col gap-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
