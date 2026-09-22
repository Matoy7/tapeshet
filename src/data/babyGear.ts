import { Bed, Suitcase, Bathtub, TShirt, BowlFood } from "@phosphor-icons/react"
import type { Icon as PhosphorIconComponent } from "@phosphor-icons/react"

/**
 * The ציוד לתינוק checklist's categories/items — moved out of
 * `BabyGearScreen.tsx` so the Personal Area screen can build "Selected Baby
 * Equipment" (checked items, grouped by their original category) from the
 * exact same data, instead of a second, drifting copy of these labels.
 *
 * One placeholder checklist row: a name plus a personal, per-user checked
 * state, held in `App.tsx` (see `gearChecked`/`onToggleGear`) so both this
 * checklist and the Personal Area screen read and write the same Set.
 */
export type GearItem = { id: string; label: string }

export type GearCategory = {
  id: string
  icon: PhosphorIconComponent
  title: string
  subtitle: string
  items: GearItem[]
}

/**
 * Placeholder content only — realistic enough to preview the expanded
 * state, trivial to replace. To swap in the real list later: replace the
 * `items` arrays below (and `title`/`subtitle`/`icon` if the categories
 * themselves change) — nothing else needs to change, since the checked-
 * state logic and rendering are generic over whatever items each category
 * holds.
 *
 * "הכנת תיק לידה" (Hospital Bag) used to be its own standalone screen with
 * its own five internal sub-groups (מוצרים לאמא / לתינוק / מסמכים / לבית
 * החולים / לחזרה הביתה). It's merged in here as one flat category — every
 * item below is carried over byte-for-byte from that screen (same ids,
 * same labels, same order, nothing dropped) — just without the extra
 * sub-grouping layer, since no other category here has one either.
 */
export const GEAR_CATEGORIES: GearCategory[] = [
  {
    id: "hospitalBag",
    icon: Suitcase,
    title: "הכנת תיק לידה",
    subtitle: "כל מה שצריך לקחת איתך לבית החולים",
    items: [
      // לאמא
      { id: "mom-1", label: "חלוק או כותונת הנקה" },
      { id: "mom-2", label: "תחתונים חד-פעמיים" },
      { id: "mom-3", label: "פדים לחזה" },
      { id: "mom-4", label: "כפכפים נוחים" },
      { id: "mom-5", label: "מוצרי טיפוח אישיים" },
      // לתינוק
      { id: "baby-1", label: "בגדי גוף (2-3 מידות)" },
      { id: "baby-2", label: "כובע ראש רך" },
      { id: "baby-3", label: "שמיכת עטיפה" },
      { id: "baby-4", label: "בגד ליציאה מבית החולים" },
      // מסמכים חשובים
      { id: "docs-1", label: "תעודת זהות" },
      { id: "docs-2", label: "כרטיס קופת חולים" },
      { id: "docs-3", label: "טופס מעקב הריון" },
      { id: "docs-4", label: "טופס בחירת בית חולים (אם רלוונטי)" },
      // דברים לבית החולים
      { id: "hospital-1", label: "מטען לטלפון" },
      { id: "hospital-2", label: "כרית קטנה מהבית" },
      { id: "hospital-3", label: "חטיפים ומשקה" },
      { id: "hospital-4", label: "אוזניות" },
      // דברים לחזרה הביתה
      { id: "home-1", label: "כיסא בטיחות מותקן ברכב" },
      { id: "home-2", label: "בגדי חזרה לאמא" },
      { id: "home-3", label: "בגד חורף/קיץ לתינוק בהתאם לעונה" },
    ],
  },
  {
    id: "nursery",
    icon: Bed,
    title: "חדר תינוק",
    subtitle: "עריסה, מצעים, מוניטור וארון",
    items: [
      { id: "nursery-1", label: "עריסה או מיטת תינוק (עם מזרן מתאים לגודל)" },
      { id: "nursery-2", label: "סדינים למיטה (כותנה רכה, כמה חלופות)" },
      { id: "nursery-3", label: "מוניטור תינוק (עם או בלי מצלמה)" },
      { id: "nursery-4", label: "ארון או קומודה לאחסון" },
    ],
  },
  {
    id: "travel",
    icon: Suitcase,
    title: "טיול ונסיעה",
    subtitle: "עגלה, כיסא בטיחות ותיק החתלה",
    items: [
      { id: "travel-1", label: "עגלת תינוק (מתאימה מגיל לידה)" },
      { id: "travel-2", label: "כיסא בטיחות לרכב (מותקן ומוכן מראש)" },
      { id: "travel-3", label: "מנשא לתינוק לטיולים קצרים" },
      { id: "travel-4", label: "תיק החתלה ניידת עם ציוד בסיסי" },
    ],
  },
  {
    id: "bath",
    icon: Bathtub,
    title: "החלפה ורחצה",
    subtitle: "שולחן החתלה, אמבטיה ומגבות",
    items: [
      { id: "bath-1", label: "שולחן החתלה עם משטח בטיחות" },
      { id: "bath-2", label: "אמבטיית תינוק עם תמיכה לגב" },
      { id: "bath-3", label: "מגבות רכות (כמה יחידות)" },
      { id: "bath-4", label: "מדחום לבדיקת חום גוף וגם אמבטיה" },
    ],
  },
  {
    id: "clothes",
    icon: TShirt,
    title: "ביגוד",
    subtitle: "חיתולים, בגדי גוף וגרביים",
    items: [
      { id: "clothes-1", label: "חיתולים (כמה גדלים)" },
      { id: "clothes-2", label: "מגבוני ניקוי" },
      { id: "clothes-3", label: "קרם החתלה לעור רגיש" },
      { id: "clothes-4", label: "בגדי גוף (100% כותנה, כמה מידות)" },
      { id: "clothes-5", label: "אוברולים נוחים לסגירה" },
      { id: "clothes-6", label: "גרביים רכים לחום" },
    ],
  },
  {
    id: "food",
    icon: BowlFood,
    title: "האכלה",
    subtitle: "בקבוקים, מוצץ וסטריליזציה",
    items: [
      { id: "food-1", label: "בקבוקי האכלה (כמה גדלים לפי גיל)" },
      { id: "food-2", label: "מוצץ מתאים לגיל התינוק" },
      { id: "food-3", label: "מכשיר סטריליזציה לחיטוי בקבוקים" },
      { id: "food-4", label: "סינר האכלה קל לניקוי" },
    ],
  },
]
