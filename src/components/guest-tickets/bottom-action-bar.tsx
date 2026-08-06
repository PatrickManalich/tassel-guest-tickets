import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BottomActionBarProps {
  disabled: boolean
  total: number
  onAddGuest: () => void
}

export function BottomActionBar({ disabled, total, onAddGuest }: BottomActionBarProps) {
  return (
    <div className="sticky bottom-0 border-t border-border bg-background p-4">
      <Button
        type="button"
        className="h-11 w-full text-base"
        onClick={onAddGuest}
        disabled={disabled}
      >
        <Plus className="size-4" aria-hidden="true" />
        Add guest
      </Button>
      {disabled ? (
        <p className="mt-2 text-center text-sm text-muted-foreground">
          All {total} tickets have been claimed
        </p>
      ) : null}
    </div>
  )
}
