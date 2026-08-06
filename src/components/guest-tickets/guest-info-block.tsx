interface GuestInfoBlockProps {
  guest: {
    name: string
    email: string | null
  }
}

export function GuestInfoBlock({ guest }: GuestInfoBlockProps) {
  return (
    <div className="text-sm">
      <p className="font-medium text-foreground">{guest.name}</p>
      <p className="text-muted-foreground">{guest.email ?? "No email provided"}</p>
    </div>
  )
}
