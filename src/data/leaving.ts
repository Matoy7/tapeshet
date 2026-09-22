import { CarSimple, House, Files, Basket, TShirt, BowlFood, ShieldCheck, Key } from "@phosphor-icons/react"
import type { Icon as PhosphorIconComponent } from "@phosphor-icons/react"

/**
 * "לפני שיוצאים" checklist's categories/items — moved out of
 * `LeavingScreen.tsx` so the Personal Area screen can build its "דברים
 * שאהבתי" section (checked outing-prep items) from the exact same data,
 * instead of a second, drifting copy of these labels.
 */
export type ArrivalMethod = "walk" | "car" | "public_transport" | "taxi" | "flight"
export type OutingType = "outdoor" | "indoor"
export type Duration = "up_to_hour" | "one_two_hours" | "two_four_hours" | "half_day" | "full_day" | "multiple_days"
export type Distance = "near" | "up_to_30" | "up_to_hour" | "up_to_two_hours" | "more_than_two_hours"
export type BabyFit = "stroller" | "carrier" | "nursing_feeding"

export type LeavingFilters = {
  arrival: ArrivalMethod[]
  outingType: OutingType[]
  duration: Duration[]
  distance: Distance[]
  babyFit: BabyFit[]
}

export const EMPTY_LEAVING_FILTERS: LeavingFilters = {
  arrival: [],
  outingType: [],
  duration: [],
  distance: [],
  babyFit: [],
}

/** One placeholder checklist row — same shape as the other checklist screens. */
export type LeavingItem = { id: string; label: string }

export type LeavingCategory = {
  id: string
  icon: PhosphorIconComponent
  title: string
  subtitle: string
  items: LeavingItem[]
  /**
   * Whether this category is relevant to the currently active filters —
   * conceptual guidance only (per the brief), used to bring the most useful
   * categories to the top when filters are active. Never used to hide a
   * category outright.
   */
  isRelevant: (filters: LeavingFilters) => boolean
}

export const LEAVING_CATEGORIES: LeavingCategory[] = [
  {
    id: "car",
    icon: CarSimple,
    title: "רכב ונסיעה",
    subtitle: "דלק, כיסא בטיחות ומסלול",
    items: [
      { id: "car-1", label: "לבדוק דלק / טעינה" },
      { id: "car-2", label: "להתקין כיסא בטיחות" },
      { id: "car-3", label: "לוודא שהעגלה בתא המטען" },
      { id: "car-4", label: "לבדוק מסלול" },
      { id: "car-5", label: "לקחת מטען לטלפון" },
    ],
    isRelevant: (f) =>
      f.arrival.includes("car") ||
      f.duration.length > 0 ||
      f.distance.length > 0 ||
      f.babyFit.some((v) => v === "stroller" || v === "carrier"),
  },
  {
    id: "home",
    icon: House,
    title: "בית לפני היציאה",
    subtitle: "חלונות, מכשירים ונעילה",
    items: [
      { id: "home-1", label: "לסגור חלונות" },
      { id: "home-2", label: "לכבות מכשירים" },
      { id: "home-3", label: "לנעול את הדלת" },
      { id: "home-4", label: "לבדוק שהכול מוכן לחזרה" },
    ],
    isRelevant: (f) => f.outingType.length > 0 || f.duration.length > 0 || f.distance.length > 0,
  },
  {
    id: "docs",
    icon: Files,
    title: "מסמכים וחפצים חשובים",
    subtitle: "תעודות, כרטיסים וארנק",
    items: [
      { id: "docs-1", label: "תעודות" },
      { id: "docs-2", label: "כרטיסים" },
      { id: "docs-3", label: "טלפון" },
      { id: "docs-4", label: "ארנק" },
      { id: "docs-5", label: "מפתחות" },
    ],
    isRelevant: (f) => f.arrival.length > 0 || f.duration.length > 0 || f.distance.length > 0,
  },
  {
    id: "baby-gear",
    icon: Basket,
    title: "ציוד לתינוק",
    subtitle: "חיתולים, בקבוק ומוצץ",
    items: [
      { id: "baby-gear-1", label: "חיתולים" },
      { id: "baby-gear-2", label: "מגבונים" },
      { id: "baby-gear-3", label: "בקבוק" },
      { id: "baby-gear-4", label: "מוצץ" },
      { id: "baby-gear-5", label: "בגדים להחלפה" },
    ],
    isRelevant: (f) =>
      f.babyFit.some((v) => v === "stroller" || v === "carrier" || v === "nursing_feeding") ||
      f.duration.length > 0 ||
      f.distance.length > 0,
  },
  {
    id: "clothing",
    icon: TShirt,
    title: "ביגוד ואביזרים",
    subtitle: "שמיכה, כובע ותיק",
    items: [
      { id: "clothing-1", label: "בגדים מתאימים" },
      { id: "clothing-2", label: "שמיכה" },
      { id: "clothing-3", label: "כובע" },
      { id: "clothing-4", label: "תיק" },
      { id: "clothing-5", label: "שקית לבגדים מלוכלכים" },
    ],
    isRelevant: (f) =>
      f.outingType.length > 0 || f.duration.length > 0 || f.babyFit.some((v) => v === "stroller" || v === "carrier"),
  },
  {
    id: "food",
    icon: BowlFood,
    title: "אוכל ושתייה",
    subtitle: "מים, חטיפים וציוד האכלה",
    items: [
      { id: "food-1", label: "מים" },
      { id: "food-2", label: "אוכל" },
      { id: "food-3", label: "חטיפים" },
      { id: "food-4", label: "בקבוק / ציוד האכלה" },
    ],
    isRelevant: (f) => f.duration.length > 0 || f.distance.length > 0 || f.babyFit.includes("nursing_feeding"),
  },
  {
    id: "comfort",
    icon: ShieldCheck,
    title: "נוחות ובטיחות",
    subtitle: "קרם הגנה, מנשא וכיסוי לעגלה",
    items: [
      { id: "comfort-1", label: "קרם הגנה" },
      { id: "comfort-2", label: "כיסוי לעגלה" },
      { id: "comfort-3", label: "מנשא" },
      { id: "comfort-4", label: "משהו נוח לישיבה" },
    ],
    isRelevant: (f) =>
      f.arrival.length > 0 ||
      f.outingType.length > 0 ||
      f.duration.length > 0 ||
      f.babyFit.some((v) => v === "stroller" || v === "carrier"),
  },
  {
    id: "small-things",
    icon: Key,
    title: "דברים קטנים שלא לשכוח",
    subtitle: "מפתחות, מטען ואוזניות",
    items: [
      { id: "small-things-1", label: "מפתחות" },
      { id: "small-things-2", label: "מטען" },
      { id: "small-things-3", label: "אוזניות" },
      { id: "small-things-4", label: "משקפי שמש" },
    ],
    // Relevant to whatever filters are active, per the brief — never hidden.
    isRelevant: () => true,
  },
]
