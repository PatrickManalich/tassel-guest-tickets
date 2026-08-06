export function GuestTicketsSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading your guest ticket details"
      className="space-y-4"
    >
      <span className="sr-only">Loading your guest ticket details…</span>
      <div aria-hidden="true" className="space-y-4">
        <div className="animate-pulse rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="h-4 w-40 rounded bg-muted" />
          <div className="mt-2 h-3 w-32 rounded bg-muted" />
          <div className="mt-4 h-3 w-36 rounded bg-muted" />
          <div className="mt-2 h-3 w-28 rounded bg-muted" />
        </div>

        <div className="animate-pulse rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="mt-2 h-3 w-24 rounded bg-muted" />
          <div className="mt-3 flex gap-2">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="size-11 rounded-full bg-muted" />
            ))}
          </div>
        </div>

        <div className="animate-pulse rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="mt-4 space-y-4">
            {Array.from({ length: 2 }, (_, index) => (
              <div key={index} className="flex items-center justify-between gap-3">
                <div className="space-y-2">
                  <div className="h-3 w-28 rounded bg-muted" />
                  <div className="h-3 w-36 rounded bg-muted" />
                </div>
                <div className="flex gap-2">
                  <div className="h-11 w-20 rounded-lg bg-muted" />
                  <div className="size-11 rounded-lg bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
