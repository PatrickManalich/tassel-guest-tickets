import { useEffect, useState, type MouseEvent } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { GuestInfoBlock } from "@/components/guest-tickets/guest-info-block"
import { InlineFormError } from "@/components/guest-tickets/inline-form-error"
import type { Guest } from "@/types/guest-tickets"

interface RemoveGuestDialogProps {
  guest: Guest | null
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
  /** See the same prop on GuestFormDialog — this dialog has no <AlertDialogTrigger> either. */
  onCloseAutoFocus?: (event: Event) => void
}

export function RemoveGuestDialog({
  guest,
  onOpenChange,
  onConfirm,
  onCloseAutoFocus,
}: RemoveGuestDialogProps) {
  const [submitting, setSubmitting] = useState(false)
  const [hasError, setHasError] = useState(false)

  // Fires when a guest is (re)selected for removal — clears any error left
  // over from a previous open, but a failed attempt keeps `guest` (and so
  // the error) in place for retry, same as GuestFormDialog.
  useEffect(() => {
    if (guest) {
      setHasError(false)
    }
  }, [guest])

  async function handleRemove(event: MouseEvent<HTMLButtonElement>) {
    // AlertDialog.Action closes on click by default — prevent that so we
    // can keep the dialog open on failure and show the inline error.
    event.preventDefault()
    setSubmitting(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } catch {
      setHasError(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AlertDialog open={guest !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent
        className="max-h-[85dvh] overflow-y-auto sm:max-w-sm"
        onCloseAutoFocus={onCloseAutoFocus}
      >
        <AlertDialogHeader className="place-items-start text-left">
          <AlertDialogTitle>Remove guest?</AlertDialogTitle>
          <AlertDialogDescription className="sr-only">
            Confirm removing this guest's ticket.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {guest ? <GuestInfoBlock guest={guest} /> : null}

        <p className="text-sm text-muted-foreground">
          This ticket will be able to be reassigned to another guest.
        </p>

        {hasError ? (
          <InlineFormError title="We couldn't remove this guest." description="Please try again." />
        ) : null}

        <AlertDialogFooter>
          {/* Same DOM-order/order-class tab pattern as GuestFormDialog's footer. */}
          {/*
            AlertDialogAction only forwards `className` to the inner Radix
            element, not to Button's own class computation — so overriding
            variant colors here needs `!important` (Tailwind's `!` suffix)
            to reliably win over the default variant's classes.
          */}
          <AlertDialogAction
            variant="destructive"
            className="order-2 h-11 bg-destructive! text-white! hover:bg-destructive/90!"
            onClick={handleRemove}
            disabled={submitting}
          >
            Remove
          </AlertDialogAction>
          <AlertDialogCancel className="order-1 h-11">Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
