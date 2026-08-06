import { Button } from "@/components/ui/button"

interface DemoControlsPanelProps {
  armed: boolean
  onArmNextFailure: () => void
}

export function DemoControlsPanel({ armed, onArmNextFailure }: DemoControlsPanelProps) {
  return (
    <section
      aria-label="Demo controls"
      className="mx-auto mt-8 max-w-sm rounded-lg border border-dashed border-muted-foreground/40 bg-muted/50 p-4 text-sm text-muted-foreground"
    >
      <p className="font-medium text-foreground">Demo controls</p>
      <p className="mt-1">Review tooling — not part of the product screen above</p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-3"
        onClick={onArmNextFailure}
        disabled={armed}
      >
        Simulate a save error
      </Button>
      <p className="mt-2" aria-live="polite">
        {armed
          ? "Armed — the next add, reassign, or remove attempt will fail once"
          : "Not armed"}
      </p>
    </section>
  )
}
