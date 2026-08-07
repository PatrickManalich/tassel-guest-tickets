import { useRef, useState } from "react"
import { BottomActionBar } from "@/components/guest-tickets/bottom-action-bar"
import { CeremonyCard } from "@/components/guest-tickets/ceremony-card"
import { GuestFormDialog } from "@/components/guest-tickets/guest-form-dialog"
import { GuestListCard } from "@/components/guest-tickets/guest-list-card"
import { GuestTicketsSkeleton } from "@/components/guest-tickets/guest-tickets-skeleton"
import { RemoveGuestDialog } from "@/components/guest-tickets/remove-guest-dialog"
import { TicketAllotmentCard } from "@/components/guest-tickets/ticket-allotment-card"
import type { GuestInput } from "@/hooks/use-guest-tickets"
import type { Allotment, Ceremony, Guest } from "@/types/guest-tickets"

interface ManageGuestTicketsScreenProps {
  loading: boolean
  ceremony: Ceremony
  allotment: Allotment
  guests: Guest[]
  addGuest: (input: GuestInput) => Promise<void>
  reassignGuest: (guestId: string, input: GuestInput) => Promise<void>
  removeGuest: (guestId: string) => Promise<void>
}

export function ManageGuestTicketsScreen({
  loading,
  ceremony,
  allotment,
  guests,
  addGuest,
  reassignGuest,
  removeGuest,
}: ManageGuestTicketsScreenProps) {
  const [isAddDialogOpen, setAddDialogOpen] = useState(false)
  const [reassigningGuest, setReassigningGuest] = useState<Guest | null>(null)
  const [removingGuest, setRemovingGuest] = useState<Guest | null>(null)

  // These dialogs are fully controlled with no <DialogTrigger>/<AlertDialogTrigger>
  // (each has more than one possible trigger element — the bottom bar button and
  // every open ticket slot, for Add). Radix's own "return focus to trigger" only
  // works with an actual Trigger component, so it's done by hand: capture
  // whichever element was focused right as a dialog opens, then restore it via
  // onCloseAutoFocus regardless of how the dialog closed (Cancel, Escape, or a
  // successful save).
  const lastTriggerRef = useRef<HTMLElement | null>(null)
  // Fallback target for when the trigger no longer exists to focus — verified
  // this actually happens: a *successful* Remove deletes its own trigger (the
  // guest row's own Remove button) as a side effect, so there's nothing to
  // return focus to. tabIndex=-1 makes an otherwise-static heading a valid,
  // stable focus target without adding it to the normal tab order.
  const headingRef = useRef<HTMLHeadingElement | null>(null)
  // A successful Remove starts a ~200ms collapse before the row actually
  // leaves the DOM, so the trigger button is still `isConnected` at the
  // instant onCloseAutoFocus fires — checking that alone isn't enough, it'll
  // focus a button that vanishes an instant later and focus falls back to
  // <body> anyway (verified this happening). This flag lets the Remove
  // success path force the stable fallback instead of trusting isConnected.
  const forceFallbackFocusRef = useRef(false)

  function captureTrigger() {
    lastTriggerRef.current = document.activeElement as HTMLElement | null
  }

  function restoreFocusToTrigger(event: Event) {
    event.preventDefault()
    if (!forceFallbackFocusRef.current && lastTriggerRef.current?.isConnected) {
      lastTriggerRef.current.focus()
    } else {
      headingRef.current?.focus()
    }
    forceFallbackFocusRef.current = false
  }

  return (
    <div className="flex min-h-svh flex-col bg-page-background">
      <header className="border-b border-hairline bg-background px-4 py-4">
        <h1 ref={headingRef} tabIndex={-1} className="text-lg font-semibold text-foreground outline-none">
          Manage guest tickets
        </h1>
      </header>

      <main className="flex-1 p-4">
        {loading ? (
          <GuestTicketsSkeleton />
        ) : (
          <div className="animate-in fade-in space-y-5 duration-200 ease-out">
            <CeremonyCard ceremony={ceremony} />
            <TicketAllotmentCard
              claimed={allotment.claimed}
              total={allotment.total}
              onAddGuest={() => {
                captureTrigger()
                setAddDialogOpen(true)
              }}
            />
            <GuestListCard
              guests={guests}
              total={allotment.total}
              onReassign={(guest) => {
                captureTrigger()
                setReassigningGuest(guest)
              }}
              onRemove={(guest) => {
                captureTrigger()
                setRemovingGuest(guest)
              }}
            />
          </div>
        )}
      </main>

      {loading ? null : (
        <BottomActionBar
          disabled={allotment.claimed === allotment.total}
          total={allotment.total}
          onAddGuest={() => {
            captureTrigger()
            setAddDialogOpen(true)
          }}
        />
      )}

      <GuestFormDialog
        open={isAddDialogOpen}
        onOpenChange={setAddDialogOpen}
        onCloseAutoFocus={restoreFocusToTrigger}
        title="Add guest"
        description="Enter the guest's name and optional email address to claim a ticket."
        submitLabel="Save"
        onSubmit={addGuest}
        errorTitle="We couldn't save your guest."
        errorDescription="Please try again."
      />

      <GuestFormDialog
        open={reassigningGuest !== null}
        onOpenChange={(open) => {
          if (!open) setReassigningGuest(null)
        }}
        onCloseAutoFocus={restoreFocusToTrigger}
        title="Reassign guest"
        description="Enter a new guest's name and optional email address to reassign this ticket."
        submitLabel="Reassign"
        currentGuest={reassigningGuest ?? undefined}
        onSubmit={async (values) => {
          if (!reassigningGuest) return
          await reassignGuest(reassigningGuest.id, values)
        }}
        errorTitle="We couldn't reassign your guest."
        errorDescription="Please try again."
      />

      <RemoveGuestDialog
        guest={removingGuest}
        onOpenChange={(open) => {
          if (!open) setRemovingGuest(null)
        }}
        onCloseAutoFocus={restoreFocusToTrigger}
        onConfirm={async () => {
          if (!removingGuest) return
          await removeGuest(removingGuest.id)
          // The row (and its Remove button) is on its way out — don't try
          // to refocus it, go straight to the fallback.
          forceFallbackFocusRef.current = true
        }}
      />
    </div>
  )
}
