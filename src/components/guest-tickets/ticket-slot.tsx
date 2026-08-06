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
        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand text-white"
      >
        <Check className="size-5" strokeWidth={2} />
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
