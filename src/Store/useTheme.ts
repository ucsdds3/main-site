import { create } from 'zustand'

interface ThemeState {
  isDark: boolean
  toggleTheme: () => void
  setIsDark: (isDark: boolean) => void
}

export const useTheme = create<ThemeState>((set) => ({
  isDark: false,
  setIsDark: (isDark: boolean) => set({ isDark }),
  toggleTheme: () => set((state) => ({ isDark: !state.isDark }))
}))