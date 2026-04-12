import { create } from 'zustand'

let toastId = 0

export const useToastStore = create((set) => ({
  toasts: [],
  show: (message, type = 'success', action = null, actionLabel = null) => {
    const id = ++toastId
    set((state) => ({
      toasts: [...state.toasts, { id, message, type, action, actionLabel }],
    }))
  },
  dismiss: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
  },
}))
