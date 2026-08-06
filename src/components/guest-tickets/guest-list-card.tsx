import { Users } from "lucide-react"
import { GuestRow } from "@/components/guest-tickets/guest-row"
import type { Guest } from "@/types/guest-tickets"

interface GuestListCardProps {
  guests: Guest[]
  total: number
  onReassign: (guest: Guest) => void
  onRemove: (guest: Guest) => void
}

export function GuestListCard({ guests, total, onReassign, onRemove }: GuestListCardProps) {
  return (
    <section
      aria-label="Your guests"
      className="rounded-xl border border-border bg-card p-4 shadow-sm"
    >
      <h2 className="text-base font-semibold text-foreground">Your guests</h2>
      {guests.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-2 py-4 text-center">
          <Users className="size-8 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm font-medium text-foreground">No guests yet</p>
          <p className="text-sm text-muted-foreground">
            You have <span className="font-medium text-foreground">{total}</span> tickets
            available
          </p>
        </div>
      ) : (
        <ul className="mt-2 divide-y divide-border">
          {guests.map((guest) => (
            <GuestRow key={guest.id} guest={guest} onReassign={onReassign} onRemove={onRemove} />
          ))}
        </ul>
      )}
    </section>
  )
}
