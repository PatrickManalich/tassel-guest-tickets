import { TicketSlot } from "@/components/guest-tickets/ticket-slot"

interface TicketAllotmentCardProps {
  claimed: number
  total: number
  onAddGuest: () => void
}

function allotmentHeadline(claimed: number, total: number) {
  if (claimed === 0) return "No tickets claimed"
  if (claimed === total) return "All tickets claimed"
  return `${claimed} of ${total} claimed`
}

export function TicketAllotmentCard({ claimed, total, onAddGuest }: TicketAllotmentCardProps) {
  const remaining = total - claimed
  const groupLabel =
    remaining > 0
      ? `${claimed} of ${total} tickets claimed, ${remaining} remaining`
      : `${claimed} of ${total} tickets claimed`

  return (
    <section
      aria-label="Your guest tickets"
      className="rounded-xl border border-hairline bg-card p-5"
    >
      <h2 className="text-base font-semibold text-foreground">Your guest tickets</h2>
      <p className="mt-0.5 text-sm text-muted-foreground" aria-live="polite">
        {allotmentHeadline(claimed, total)}
      </p>
      <div role="group" aria-label={groupLabel} className="mt-4 flex justify-between">
        {Array.from({ length: total }, (_, index) => (
          <TicketSlot key={index} filled={index < claimed} onAddGuest={onAddGuest} />
        ))}
      </div>
    </section>
  )
}
