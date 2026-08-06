import { Check, Plus } from "lucide-react"

interface TicketSlotProps {
  filled: boolean
  onAddGuest: () => void
}

export function TicketSlot({ filled, onAddGuest }: TicketSlotProps) {
  if (filled) {
    return (
      <div
        aria-hidden="true"
        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-foreground text-background"
      >
        <Check className="size-5" />
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={onAddGuest}
      aria-label="Add guest to open ticket"
      className="flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-foreground text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Plus className="size-5" />
    </button>
  )
}
