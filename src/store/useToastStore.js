import { create } from 'zustand'

let toastId = 0

export const useToastStore = create((set) => ({
  toasts: [],
  show: (message, type = 'success') => {
    const id = ++toastId
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }))
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, 3000)
  },
  dismiss: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
  },
}))
