import { toast } from "sonner"

export function handleApiError(error: any, handleError: (msg: string) => void) {
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error ||
    "Erro inesperado"

  toast.warning(message)
  handleError(message)
}