import { DemoControlsPanel } from "@/components/demo/demo-controls-panel"
import { useGuestTickets } from "@/hooks/use-guest-tickets"

function App() {
  const guestTickets = useGuestTickets()

  return (
    <div className="min-h-svh bg-muted/30 p-4">
      {/* TODO: replace with <ManageGuestTicketsScreen /> */}
      <div className="mx-auto max-w-sm rounded-lg border bg-background p-4 text-sm text-muted-foreground">
        Screen placeholder — state: {guestTickets.screenState}, claimed{" "}
        {guestTickets.allotment.claimed}/{guestTickets.allotment.total}
      </div>

      <DemoControlsPanel
        armed={guestTickets.nextActionArmedToFail}
        onArmNextFailure={guestTickets.armNextFailure}
      />
    </div>
  )
}

export default App
