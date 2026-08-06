import { useState } from "react"
import { Check, Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DemoControlsPanelProps {
  armed: boolean
  onArmNextFailure: () => void
}

// Bottom-left floating toggle + popover, styled after the TanStack Query /
// TanStack Router devtools convention — deliberately outside the product
// component tree and never mistaken for a product FAB (no fill, no shadow
// the Add guest button doesn't also have). Uncontrolled `open` state means
// it's always closed on load; nothing here persists across reloads.
export function DemoControlsPanel({ armed, onArmNextFailure }: DemoControlsPanelProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Review tooling"
          className="fixed bottom-24 left-4 z-40 flex size-11 items-center justify-center rounded-full border border-muted-foreground/40 bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Wrench className="size-5" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" align="start" className="w-80">
        <PopoverHeader>
          <PopoverTitle className="text-base font-semibold text-foreground">
            Tassel dev tools
          </PopoverTitle>
          <PopoverDescription>Not part of final product</PopoverDescription>
        </PopoverHeader>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2 w-full"
          onClick={onArmNextFailure}
          disabled={armed}
        >
          Simulate a save error
        </Button>
        <p
          className="mt-2 flex min-h-5 items-center gap-1.5 whitespace-nowrap text-sm text-foreground"
          aria-live="polite"
        >
          {armed ? (
            <>
              <Check className="size-4 shrink-0" aria-hidden="true" />
              Armed - next save will throw an error
            </>
          ) : null}
        </p>
      </PopoverContent>
    </Popover>
  )
}
