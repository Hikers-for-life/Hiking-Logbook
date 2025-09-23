import * as React from "react"
import { useToast } from "../../hooks/use-toast"
import { useNavigate } from "react-router-dom"

export function Toaster() {
  const { toasts, dismiss } = useToast()
  const navigate = useNavigate()

  const handleClose = (id) => {
    dismiss(id)             // close the toast
    navigate("/dashboard")    // navigate to your ViewProfile route
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts
        .filter((t) => t.open) // only show open toasts
        .map((toast) => (
          <div
            key={toast.id}
            className="rounded-lg bg-white shadow-lg border px-4 py-2 w-80 transition-opacity duration-300"
          >
            <div className="font-semibold">{toast.title}</div>
            {toast.description && (
              <div className="text-sm text-gray-600">{toast.description}</div>
            )}
            <button
              className="mt-2 text-sm text-blue-500"
              onClick={() => handleClose(toast.id)}
            >
              Close
            </button>
          </div>
        ))}
    </div>
  )
}
