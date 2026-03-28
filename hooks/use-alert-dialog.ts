import { useState } from "react"

export function useApiError() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")

  function handleError(msg: string) {
    setMessage(msg)
    setOpen(true)
  }

  return {
    open,
    message,
    setOpen,
    handleError
  }
}