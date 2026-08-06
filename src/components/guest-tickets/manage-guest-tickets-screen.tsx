import { useState } from "react"
import { BottomActionBar } from "@/components/guest-tickets/bottom-action-bar"
import { CeremonyCard } from "@/components/guest-tickets/ceremony-card"
import { GuestFormDialog } from "@/components/guest-tickets/guest-form-dialog"
import { GuestListCard } from "@/components/guest-tickets/guest-list-card"
import { GuestTicketsSkeleton } from "@/components/guest-tickets/guest-tickets-skeleton"
import { TicketAllotmentCard } from "@/components/guest-tickets/ticket-allotment-card"
import type { GuestInput } from "@/hooks/use-guest-tickets"
import type { Allotment, Ceremony, Guest } from "@/types/guest-tickets"

interface ManageGuestTicketsScreenProps {
  loading: boolean
  ceremony: Ceremony
  allotment: Allotment
  guests: Guest[]
  addGuest: (input: GuestInput) => Promise<void>
}

export function ManageGuestTicketsScreen({
  loading,
  ceremony,
  allotment,
  guests,
  addGuest,
}: ManageGuestTicketsScreenProps) {
  const [isAddDialogOpen, setAddDialogOpen] = useState(false)

  return (
    <div className="flex min-h-svh flex-col bg-muted/40">
      <header className="border-b border-border bg-background px-4 py-4">
        <h1 className="text-lg font-semibold text-foreground">Manage guest tickets</h1>
      </header>

      <main className="flex-1 space-y-4 p-4">
        {loading ? (
          <GuestTicketsSkeleton />
        ) : (
          <>
            <CeremonyCard ceremony={ceremony} />
            <TicketAllotmentCard
              claimed={allotment.claimed}
              total={allotment.total}
              onAddGuest={() => setAddDialogOpen(true)}
            />
            <GuestListCard
              guests={guests}
              total={allotment.total}
              onReassign={() => {}}
              onRemove={() => {}}
            />
          </>
        )}
      </main>

      {loading ? null : (
        <BottomActionBar
          disabled={allotment.claimed === allotment.total}
          total={allotment.total}
          onAddGuest={() => setAddDialogOpen(true)}
        />
      )}

      <GuestFormDialog
        open={isAddDialogOpen}
        onOpenChange={setAddDialogOpen}
        title="Add guest"
        description="Enter the guest's name and optional email address to claim a ticket."
        submitLabel="Save"
        onSubmit={addGuest}
        errorTitle="We couldn't save your guest."
        errorDescription="Please try again."
      />
    </div>
  )
}
