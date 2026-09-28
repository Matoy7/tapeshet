import { useEffect, useRef, useState } from "react"
import { Icon as PhosphorIcon } from "@/components/ui/PhosphorIcon"
import { Heart } from "@phosphor-icons/react"
import { cn } from "@/lib/cn"

type FavoriteButtonProps = {
  favorited: boolean
  onToggle: () => void
}

/**
 * A personal save/bookmark toggle — same stacked/cross-faded heart icons and
 * pop animation as the app has always used, but now scoped to just the
 * signed-in person: no shared count, no group context, nothing else to
 * coordinate. Saving a name is a private action.
 */
export function FavoriteButton({ favorited, onToggle }: FavoriteButtonProps) {
  const [pop, setPop] = useState(false)
  const previous = useRef(favorited)

  useEffect(() => {
    if (favorited && !previous.current) {
      setPop(true)
      const id = window.setTimeout(() => setPop(false), 240)
      previous.current = favorited
      return () => window.clearTimeout(id)
    }
    previous.current = favorited
  }, [favorited])

  return (
    <button
      type="button"
      aria-pressed={favorited}
      aria-label={favorited ? "הסירו מהשמות השמורים" : "שמרו את השם הזה"}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onToggle()
      }}
      className={cn(
        "group -my-2 -ms-2 inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 py-2",
        "text-label transition-colors duration-150 select-none",
        favorited ? "text-accent" : "text-content-muted",
        !favorited &&
          "[@media(hover:hover)_and_(pointer:fine)]:hover:text-content-secondary",
      )}
    >
      <span
        className={cn(
          "relative inline-flex size-4 shrink-0 items-center justify-center transition-transform duration-200 ease-out",
          "[@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-110",
          pop && "animate-like-pop",
        )}
      >
        <PhosphorIcon
          icon={Heart}
          size={16}
          color="currentColor"
          weight="regular"
          className={cn(
            "absolute transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none",
            favorited ? "scale-90 opacity-0" : "scale-100 opacity-100",
          )}
        />
        <PhosphorIcon
          icon={Heart}
          size={16}
          color="currentColor"
          weight="fill"
          className={cn(
            "absolute transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none",
            favorited ? "scale-100 opacity-100" : "scale-50 opacity-0",
          )}
        />
      </span>
    </button>
  )
}
