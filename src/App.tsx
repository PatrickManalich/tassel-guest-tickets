import { DemoControlsPanel } from "@/components/demo/demo-controls-panel"
import { ManageGuestTicketsScreen } from "@/components/guest-tickets/manage-guest-tickets-screen"
import { useGuestTickets } from "@/hooks/use-guest-tickets"

function App() {
  const guestTickets = useGuestTickets()

  return (
    <div className="min-h-svh bg-muted/30">
      <ManageGuestTicketsScreen
        loading={guestTickets.loading}
        ceremony={guestTickets.ceremony}
        allotment={guestTickets.allotment}
        guests={guestTickets.guests}
      />

      <DemoControlsPanel
        armed={guestTickets.nextActionArmedToFail}
        onArmNextFailure={guestTickets.armNextFailure}
      />
    </div>
  )
}

export default App
