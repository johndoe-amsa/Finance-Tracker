import { create } from 'zustand'

export const useAppStore = create((set) => ({
  currentYear: new Date().getFullYear(),
  currentMonth: new Date().getMonth() + 1,
  unverifiedCount: 0,
  setMonth: (year, month) => set({ currentYear: year, currentMonth: month }),
  setUnverifiedCount: (count) => set({ unverifiedCount: count }),
}))
