import { useMemo, useState } from "react"
import { PROFESSIONALS, type Professional, type ProfessionalCategory } from "@/data/professionals"

export type ProfessionalFiltersValue = {
  area: string[]
  distance: string[]
  rating: string[]
  price: string[]
  availability: string[]
  serviceMode: string[]
  /** Category-specific fields, keyed by field id (see filterOptions.ts). */
  extra: Record<string, string[]>
}

export const EMPTY_PROFESSIONAL_FILTERS: ProfessionalFiltersValue = {
  area: [],
  distance: [],
  rating: [],
  price: [],
  availability: [],
  serviceMode: [],
  extra: {},
}

export function professionalFiltersActiveCount(value: ProfessionalFiltersValue): number {
  return (
    value.area.length +
    value.distance.length +
    value.rating.length +
    value.price.length +
    value.availability.length +
    value.serviceMode.length +
    Object.values(value.extra).reduce((sum, values) => sum + values.length, 0)
  )
}

function matchesRating(p: Professional, selected: string[]): boolean {
  if (selected.length === 0) return true
  return selected.some((v) => {
    if (v === "rating_45") return p.rating !== null && p.rating >= 4.5
    if (v === "rating_40") return p.rating !== null && p.rating >= 4.0
    if (v === "rated_only") return p.rating !== null
    if (v === "unrated") return p.rating === null
    return true
  })
}

function matchesPrice(p: Professional, selected: string[]): boolean {
  if (selected.length === 0 || selected.includes("price_any")) return true
  return selected.some((v) => {
    if (p.price === null) return false
    if (v === "price_300") return p.price <= 300
    if (v === "price_300_500") return p.price > 300 && p.price <= 500
    if (v === "price_500_800") return p.price > 500 && p.price <= 800
    if (v === "price_800_1200") return p.price > 800 && p.price <= 1200
    if (v === "price_1200_plus") return p.price > 1200
    return false
  })
}

function matchesDistance(p: Professional, selected: string[]): boolean {
  if (selected.length === 0 || selected.includes("dist_any")) return true
  return selected.some((v) => {
    if (v === "dist_5") return p.distanceKm <= 5
    if (v === "dist_10") return p.distanceKm <= 10
    if (v === "dist_20") return p.distanceKm <= 20
    if (v === "dist_30") return p.distanceKm <= 30
    return true
  })
}

function matchesArea(p: Professional, selected: string[]): boolean {
  if (selected.length === 0 || selected.includes("all_areas")) return true
  return selected.includes(p.area)
}

function matchesAvailability(p: Professional, selected: string[]): boolean {
  if (selected.length === 0 || selected.includes("avail_any")) return true
  return selected.some((v) => (v === "coming_soon" || v === "accepting_new" ? p.availability.includes(v) : true))
}

function matchesServiceMode(p: Professional, selected: string[]): boolean {
  if (selected.length === 0) return true
  return selected.some((v) => {
    if (v === "in_person_and_online") return p.serviceModes.includes("in_person") && p.serviceModes.includes("online")
    return p.serviceModes.includes(v as Professional["serviceModes"][number])
  })
}

function matchesExtra(p: Professional, extra: Record<string, string[]>): boolean {
  return Object.entries(extra).every(([fieldId, selected]) => {
    if (selected.length === 0) return true
    const values = p.attrs[fieldId] ?? []
    return selected.some((v) => values.includes(v))
  })
}

function matchesSearch(p: Professional, query: string): boolean {
  const trimmed = query.trim().toLowerCase()
  if (!trimmed) return true
  const haystack = [p.name, p.title, p.areaLabel, ...p.displayTags].join(" ").toLowerCase()
  return haystack.includes(trimmed)
}

export type ProfessionalSort = "relevance" | "rating" | "reviews" | "distance" | "price"

function sortProfessionals(list: Professional[], sort: ProfessionalSort): Professional[] {
  const sorted = [...list]
  switch (sort) {
    case "rating":
      return sorted.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1))
    case "reviews":
      return sorted.sort((a, b) => b.reviewCount - a.reviewCount)
    case "distance":
      return sorted.sort((a, b) => a.distanceKm - b.distanceKm)
    case "price":
      return sorted.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity))
    case "relevance":
    default:
      // No documented ranking signal beyond "reviewed and well-regarded
      // first" — reusing review count keeps this from reading as random,
      // without pretending to a relevance model that doesn't exist.
      return sorted.sort((a, b) => b.reviewCount - a.reviewCount)
  }
}

type UseProfessionalsResult = {
  category: ProfessionalCategory
  setCategory: (category: ProfessionalCategory) => void
  search: string
  setSearch: (search: string) => void
  filters: ProfessionalFiltersValue
  setFilters: (filters: ProfessionalFiltersValue) => void
  sort: ProfessionalSort
  setSort: (sort: ProfessionalSort) => void
  results: Professional[]
}

/**
 * Category/search/filter/sort state and derived results for the בעלי מקצוע
 * directory, entirely local — there is no professionals table in Supabase
 * yet (see data/professionals.ts), so this mirrors useNames.ts's shape
 * without the network round-trip. Favorites are NOT part of this hook —
 * see `useProfessionalFavorites` below — since "אזור אישי" needs the exact
 * same favorites Set this screen uses, not a second instance scoped to
 * whichever component happens to call this hook.
 */
export function useProfessionals(): UseProfessionalsResult {
  const [category, setCategoryState] = useState<ProfessionalCategory>("mohel")
  const [search, setSearch] = useState("")
  const [filters, setFiltersState] = useState<ProfessionalFiltersValue>(EMPTY_PROFESSIONAL_FILTERS)
  const [sort, setSort] = useState<ProfessionalSort>("relevance")

  // Switching category clears category-specific filters (a lactation
  // specialty has no meaning once you're looking at doulas) but keeps the
  // shared ones (area, price, rating…) — the person's context carries over.
  const setCategory = (next: ProfessionalCategory) => {
    setCategoryState(next)
    setFiltersState((f) => ({ ...f, extra: {} }))
  }

  const setFilters = (next: ProfessionalFiltersValue) => setFiltersState(next)

  const results = useMemo(() => {
    const filtered = PROFESSIONALS.filter(
      (p) =>
        p.category === category &&
        matchesSearch(p, search) &&
        matchesArea(p, filters.area) &&
        matchesDistance(p, filters.distance) &&
        matchesRating(p, filters.rating) &&
        matchesPrice(p, filters.price) &&
        matchesAvailability(p, filters.availability) &&
        matchesServiceMode(p, filters.serviceMode) &&
        matchesExtra(p, filters.extra),
    )
    return sortProfessionals(filtered, sort)
  }, [category, search, filters, sort])

  return { category, setCategory, search, setSearch, filters, setFilters, sort, setSort, results }
}

export type UseProfessionalFavoritesResult = {
  favorites: Set<string>
  toggleFavorite: (id: string) => void
}

/**
 * Which professionals the person has favorited — lifted out of
 * `useProfessionals` and called once in App.tsx, so `ProfessionalsScreen`
 * and `PersonalAreaScreen` share this exact Set instead of each holding
 * their own copy. Session-only for now, same as the checklist screens'
 * checked-state: real per-user persistence is a follow-up once a
 * professionals table exists.
 */
export function useProfessionalFavorites(): UseProfessionalFavoritesResult {
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return { favorites, toggleFavorite }
}
