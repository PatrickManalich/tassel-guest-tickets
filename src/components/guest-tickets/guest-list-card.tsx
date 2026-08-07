import { useEffect, useRef, useState } from "react"
import { Users } from "lucide-react"
import { GuestRow } from "@/components/guest-tickets/guest-row"
import type { Guest } from "@/types/guest-tickets"

interface GuestListCardProps {
  guests: Guest[]
  total: number
  onReassign: (guest: Guest) => void
  onRemove: (guest: Guest) => void
}

const ROW_MOTION_MS = 200

export function GuestListCard({ guests, total, onReassign, onRemove }: GuestListCardProps) {
  const [displayGuests, setDisplayGuests] = useState(guests)
  const [enteringIds, setEnteringIds] = useState<Set<string>>(new Set())
  const [exitingIds, setExitingIds] = useState<Set<string>>(new Set())
  const hasMountedRef = useRef(false)
  const prevGuestsRef = useRef(guests)

  // Diff the incoming guest list against the previous one so add/remove can
  // each get their own animation rather than an instant DOM swap. Removed
  // rows stay mounted (and marked exiting) until their collapse finishes;
  // added rows are flagged entering only after the initial mount, so the
  // guests already present on first load don't replay an "add" animation
  // that the skeleton-to-content crossfade already covers.
  useEffect(() => {
    const prevIds = new Set(prevGuestsRef.current.map((guest) => guest.id))
    const currentIds = new Set(guests.map((guest) => guest.id))
    const removedIds = [...prevIds].filter((id) => !currentIds.has(id))
    const addedIds = [...currentIds].filter((id) => !prevIds.has(id))
    prevGuestsRef.current = guests

    if (removedIds.length > 0) {
      setExitingIds((prev) => new Set([...prev, ...removedIds]))
      const timeout = setTimeout(() => {
        setDisplayGuests(guests)
        setExitingIds((prev) => {
          const next = new Set(prev)
          removedIds.forEach((id) => next.delete(id))
          return next
        })
      }, ROW_MOTION_MS)
      return () => clearTimeout(timeout)
    }

    setDisplayGuests(guests)
    if (hasMountedRef.current && addedIds.length > 0) {
      setEnteringIds(new Set(addedIds))
      const timeout = setTimeout(() => {
        setEnteringIds((prev) => {
          const next = new Set(prev)
          addedIds.forEach((id) => next.delete(id))
          return next
        })
      }, ROW_MOTION_MS)
      return () => clearTimeout(timeout)
    }
  }, [guests])

  useEffect(() => {
    hasMountedRef.current = true
  }, [])

  return (
    <section
      aria-label="Your guests"
      className="rounded-xl border border-hairline bg-card p-5"
    >
      <h2 className="text-base font-semibold text-foreground">Your guests</h2>
      {displayGuests.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-2 py-4 text-center">
          <Users className="size-8 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm font-medium text-foreground">No guests yet</p>
          <p className="text-sm text-muted-foreground">
            You have <span className="font-medium text-foreground">{total}</span> tickets
            available
          </p>
        </div>
      ) : (
        <ul className="mt-2">
          {displayGuests.map((guest) => (
            <GuestRow
              key={guest.id}
              guest={guest}
              onReassign={onReassign}
              onRemove={onRemove}
              entering={enteringIds.has(guest.id)}
              exiting={exitingIds.has(guest.id)}
            />
          ))}
        </ul>
      )}
    </section>
  )
}
