import { useCallback, useEffect, useRef, useState } from "react"
import type { Allotment, Ceremony, Guest, Relationship } from "@/types/guest-tickets"
import { mockAllotment, mockCeremony, mockGuests } from "@/data/mock-data"

export type ScreenState = "loading" | "empty" | "populated" | "full"

export interface GuestInput {
  name: string
  email: string
  relationship: Relationship | null
}

const INITIAL_LOAD_DELAY_MS = 700
const ACTION_DELAY_MS = 600

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

export interface UseGuestTicketsResult {
  loading: boolean
  ceremony: Ceremony
  allotment: Allotment
  guests: Guest[]
  screenState: ScreenState
  nextActionArmedToFail: boolean
  armNextFailure: () => void
  addGuest: (input: GuestInput) => Promise<void>
  reassignGuest: (guestId: string, input: GuestInput) => Promise<void>
  removeGuest: (guestId: string) => Promise<void>
}

export function useGuestTickets(): UseGuestTicketsResult {
  const [loading, setLoading] = useState(true)
  const [guests, setGuests] = useState<Guest[]>([])
  const [nextActionArmedToFail, setNextActionArmedToFail] = useState(false)
  const armedRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    delay(INITIAL_LOAD_DELAY_MS).then(() => {
      if (cancelled) return
      setGuests(mockGuests)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const armNextFailure = useCallback(() => {
    armedRef.current = true
    setNextActionArmedToFail(true)
  }, [])

  const runAction = useCallback(async (mutate: () => void) => {
    await delay(ACTION_DELAY_MS)
    if (armedRef.current) {
      armedRef.current = false
      setNextActionArmedToFail(false)
      // The message here is for devtools only — callers supply their own
      // user-facing copy (e.g. GuestFormDialog's errorTitle/errorDescription
      // props) rather than reading this string.
      throw new Error("Simulated save failure")
    }
    mutate()
  }, [])

  const addGuest = useCallback(
    (input: GuestInput) =>
      runAction(() => {
        setGuests((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            name: input.name.trim(),
            email: input.email.trim() || null,
            relationship: input.relationship,
          },
        ])
      }),
    [runAction],
  )

  const reassignGuest = useCallback(
    (guestId: string, input: GuestInput) =>
      runAction(() => {
        setGuests((prev) =>
          prev.map((guest) =>
            guest.id === guestId
              ? {
                  ...guest,
                  name: input.name.trim(),
                  email: input.email.trim() || null,
                  relationship: input.relationship,
                }
              : guest,
          ),
        )
      }),
    [runAction],
  )

  const removeGuest = useCallback(
    (guestId: string) =>
      runAction(() => {
        setGuests((prev) => prev.filter((guest) => guest.id !== guestId))
      }),
    [runAction],
  )

  const allotment: Allotment = { total: mockAllotment.total, claimed: guests.length }
  const screenState: ScreenState = loading
    ? "loading"
    : allotment.claimed === 0
      ? "empty"
      : allotment.claimed === allotment.total
        ? "full"
        : "populated"

  return {
    loading,
    ceremony: mockCeremony,
    allotment,
    guests,
    screenState,
    nextActionArmedToFail,
    armNextFailure,
    addGuest,
    reassignGuest,
    removeGuest,
  }
}
