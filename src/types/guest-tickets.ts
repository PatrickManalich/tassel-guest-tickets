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

export interface Guest {
  id: string
  name: string
  email: string | null
}
