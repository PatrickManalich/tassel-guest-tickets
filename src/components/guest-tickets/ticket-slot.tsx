import { useEffect, useRef, useState } from "react"
import { Check, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface TicketSlotProps {
  filled: boolean
  onAddGuest: () => void
}

// The action that fills a slot (Save in the Add dialog) also closes that
// dialog, which plays its own ~200ms close animation on top of the slot.
// REVEAL_DELAY_MS gives that close animation room to finish (with buffer)
// before the checkmark reveals, so it isn't playing out hidden behind it.
const REVEAL_DELAY_MS = 400
const FILL_ANIMATION_MS = 300

type CheckmarkState = "static" | "waiting" | "revealing"

export function TicketSlot({ filled, onAddGuest }: TicketSlotProps) {
  // "static": no animation — either always was filled (initial load) or has
  // already finished revealing. "waiting"/"revealing" only ever happen for
  // a live open -> claimed transition, never the initial mount (including
  // guests already claimed on first load — that moment is already covered
  // by the skeleton-to-content crossfade).
  const [checkmarkState, setCheckmarkState] = useState<CheckmarkState>("static")
  const hasMountedRef = useRef(false)

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      return
    }
    if (!filled) return

    setCheckmarkState("waiting")
    const revealTimeout = setTimeout(() => setCheckmarkState("revealing"), REVEAL_DELAY_MS)
    return () => clearTimeout(revealTimeout)
  }, [filled])

  useEffect(() => {
    if (checkmarkState !== "revealing") return
    const settleTimeout = setTimeout(() => setCheckmarkState("static"), FILL_ANIMATION_MS)
    return () => clearTimeout(settleTimeout)
  }, [checkmarkState])

  if (filled) {
    return (
      <div
        aria-hidden="true"
        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand text-white"
      >
        <Check
          className={cn(
            "size-5",
            checkmarkState === "waiting" && "opacity-0",
            checkmarkState === "revealing" &&
              "animate-in zoom-in-50 fade-in duration-300 ease-out",
          )}
          strokeWidth={2}
        />
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={onAddGuest}
      aria-label="Add guest to open ticket"
      className="flex size-11 shrink-0 items-center justify-center rounded-full border border-hairline-interactive text-hairline-interactive transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Plus className="size-5" strokeWidth={1.5} />
    </button>
  )
}
