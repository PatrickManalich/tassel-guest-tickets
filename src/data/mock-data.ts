import type { Allotment, Ceremony, Guest } from "@/types/guest-tickets"

export const mockCeremony: Ceremony = {
  school: "Arizona State University",
  name: "Spring 2026 Commencement",
  date: "2026-05-11T17:00:00-07:00",
  venue: "Sun Devil Stadium",
}

export const mockAllotment: Allotment = {
  total: 5,
  claimed: 2,
}

export const mockGuests: Guest[] = [
  { id: "g1", name: "Maria Delgado", email: "maria@example.com" },
  { id: "g2", name: "James Okafor", email: null },
]
