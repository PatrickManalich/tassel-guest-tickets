import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Guest } from "@/types/guest-tickets"

interface GuestRowProps {
  guest: Guest
  onReassign: (guest: Guest) => void
  onRemove: (guest: Guest) => void
}

export function GuestRow({ guest, onReassign, onRemove }: GuestRowProps) {
  return (
    <li className="flex items-center justify-between gap-3 py-3">
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
    </li>
  )
}
