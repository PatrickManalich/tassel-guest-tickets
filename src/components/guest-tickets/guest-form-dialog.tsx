import { useEffect, useId, useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GuestInfoBlock } from "@/components/guest-tickets/guest-info-block"
import { InlineFormError } from "@/components/guest-tickets/inline-form-error"

export interface GuestFormValues {
  name: string
  email: string
}

interface GuestFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  submitLabel: string
  onSubmit: (values: GuestFormValues) => Promise<void>
  errorTitle: string
  errorDescription?: string
  /** Reassign only: the guest currently holding this ticket, shown read-only above the fields. */
  currentGuest?: { name: string; email: string | null }
  /**
   * Forwarded to Radix's DialogContent. This dialog is fully controlled with
   * no <DialogTrigger>, and Radix's own "return focus to trigger" default
   * only works with an actual DialogTrigger — verified empirically that
   * without it, focus falls back to <body> on close. Callers are expected
   * to capture the trigger element and refocus it here.
   */
  onCloseAutoFocus?: (event: Event) => void
}

// Pragmatic check, not a full RFC 5322 implementation — that tends to reject
// valid unusual addresses. This just catches obviously malformed input.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isEmailValid(value: string) {
  return value.trim() === "" || EMAIL_PATTERN.test(value.trim())
}

export function GuestFormDialog({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  onSubmit,
  errorTitle,
  errorDescription,
  currentGuest,
  onCloseAutoFocus,
}: GuestFormDialogProps) {
  const nameId = useId()
  const emailId = useId()
  const emailErrorId = useId()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [emailTouched, setEmailTouched] = useState(false)
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [hasError, setHasError] = useState(false)

  // Only fires when the dialog transitions into open, not on every re-render
  // while it's already open — a failed attempt keeps the entered data and
  // the error visible for retry, per SPEC's shared action flow.
  useEffect(() => {
    if (open) {
      setName("")
      setEmail("")
      setEmailTouched(false)
      setSubmitAttempted(false)
      setHasError(false)
    }
  }, [open])

  const emailValid = isEmailValid(email)
  const showEmailError = (emailTouched || submitAttempted) && !emailValid
  const canSubmit = name.trim().length > 0 && emailValid && !submitting

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitAttempted(true)
    if (!canSubmit) return

    setSubmitting(true)
    try {
      await onSubmit({ name, email })
      onOpenChange(false)
    } catch {
      setHasError(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[85dvh] overflow-y-auto sm:max-w-sm"
        onCloseAutoFocus={onCloseAutoFocus}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="sr-only">{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-2 space-y-4">
          {currentGuest ? <GuestInfoBlock guest={currentGuest} /> : null}

          <div className="space-y-1.5">
            <Label htmlFor={nameId} className="gap-0">
              Name<span className="ml-0.5 text-destructive">*</span>
            </Label>
            <Input
              id={nameId}
              className="h-11"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter first and last name"
              required
              aria-required="true"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={emailId}>Email</Label>
            <Input
              id={emailId}
              className="h-11"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              onBlur={() => setEmailTouched(true)}
              placeholder="Enter email address"
              aria-invalid={showEmailError}
              aria-describedby={showEmailError ? emailErrorId : undefined}
            />
            {showEmailError ? (
              <p id={emailErrorId} className="text-sm text-destructive">
                Enter a valid email address.
              </p>
            ) : null}
          </div>

          {hasError ? (
            <InlineFormError title={errorTitle} description={errorDescription} />
          ) : null}

          <DialogFooter>
            {/*
              Save comes before Cancel in source order so Tab from the last
              field reaches Save next when it's enabled, and native
              disabled-button skipping falls through to Cancel when it's
              not. `order` classes below restore the usual visual
              placement (Cancel first, Save last) without touching tab order.
            */}
            <Button type="submit" className="order-2 h-11" disabled={!canSubmit}>
              {submitLabel}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="order-1 h-11"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
