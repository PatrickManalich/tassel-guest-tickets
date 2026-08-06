import { useEffect, useRef } from "react"
import { TriangleAlert } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface InlineFormErrorProps {
  title: string
  description?: string
}

export function InlineFormError({ title, description = "Please try again." }: InlineFormErrorProps) {
  const alertRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    alertRef.current?.focus()
  }, [])

  return (
    <Alert ref={alertRef} variant="destructive" tabIndex={-1} className="focus:outline-none">
      <TriangleAlert aria-hidden="true" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  )
}
