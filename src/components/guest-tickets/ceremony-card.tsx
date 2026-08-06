import { Calendar, MapPin } from "lucide-react"
import type { Ceremony } from "@/types/guest-tickets"

// The mock ceremony's venue (Sun Devil Stadium, ASU) sits in a fixed-offset
// zone with no DST, so this is hardcoded rather than derived from Ceremony,
// which has no timezone field.
const CEREMONY_TIME_ZONE = "America/Phoenix"

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "numeric",
  day: "numeric",
  year: "numeric",
  timeZone: CEREMONY_TIME_ZONE,
})

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZoneName: "short",
  timeZone: CEREMONY_TIME_ZONE,
})

function formatCeremonyDateTime(iso: string) {
  const date = new Date(iso)
  return `${dateFormatter.format(date)} • ${timeFormatter.format(date)}`
}

interface CeremonyCardProps {
  ceremony: Ceremony
}

export function CeremonyCard({ ceremony }: CeremonyCardProps) {
  return (
    <section
      aria-label="Ceremony details"
      className="rounded-xl border border-border bg-card p-4 shadow-sm"
    >
      <h2 className="text-base font-semibold text-foreground">{ceremony.name}</h2>
      <p className="mt-0.5 text-sm text-muted-foreground">{ceremony.school}</p>
      <div className="mt-3 flex items-center gap-2 text-sm text-foreground">
        <Calendar className="size-4 text-muted-foreground" aria-hidden="true" />
        <span>{formatCeremonyDateTime(ceremony.date)}</span>
      </div>
      <div className="mt-1.5 flex items-center gap-2 text-sm text-foreground">
        <MapPin className="size-4 text-muted-foreground" aria-hidden="true" />
        <span>{ceremony.venue}</span>
      </div>
    </section>
  )
}
