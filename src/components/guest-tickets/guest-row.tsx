import { useEffect, useState } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Guest } from "@/types/guest-tickets"

interface GuestRowProps {
  guest: Guest
  onReassign: (guest: Guest) => void
  onRemove: (guest: Guest) => void
  /** True for one render when this row was just added live (not present on initial load). */
  entering?: boolean
  /** True while this row is being removed — kept mounted so the collapse can play. */
  exiting?: boolean
}

export function GuestRow({
  guest,
  onReassign,
  onRemove,
  entering = false,
  exiting = false,
}: GuestRowProps) {
  const [hasEntered, setHasEntered] = useState(!entering)

  // Mount collapsed, then expand on the next frame so the transition has a
  // "from" state to animate from — a plain CSS transition can't do this on
  // its own the way an animate-in keyframe can.
  useEffect(() => {
    if (!entering) return
    const frame = requestAnimationFrame(() => setHasEntered(true))
    return () => cancelAnimationFrame(frame)
  }, [entering])

  const expanded = exiting ? false : entering ? hasEntered : true

  return (
    <li>
      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-200 motion-reduce:transition-none",
          expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          exiting ? "ease-in" : "ease-out",
        )}
      >
        <div className="overflow-hidden">
          <div className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{guest.name}</p>
              <p className="truncate text-sm text-muted-foreground">
                {guest.email ?? "No email provided"}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-11"
                onClick={() => onReassign(guest)}
              >
                Reassign
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-11"
                onClick={() => onRemove(guest)}
                aria-label={`Remove ${guest.name}`}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </li>
  )
}
