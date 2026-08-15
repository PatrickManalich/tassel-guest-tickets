export interface Ceremony {
  school: string
  name: string
  date: string
  venue: string
}

export interface Allotment {
  total: number
  claimed: number
}

export const RELATIONSHIP_OPTIONS = [
  "Mother",
  "Father",
  "Guardian",
  "Grandmother",
  "Grandfather",
  "Sibling",
  "Partner",
  "Aunt",
  "Uncle",
  "Cousin",
  "Child",
  "Friend",
  "Other",
] as const

export type Relationship = (typeof RELATIONSHIP_OPTIONS)[number]

export interface Guest {
  id: string
  name: string
  email: string | null
  relationship: Relationship | null
}
