import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { Theme, ThemeMode } from "../theme"

interface ThemeStore {
  theme: Theme
  mode: ThemeMode
  setTheme: (theme: Theme) => void
  setMode: (mode: ThemeMode) => void
  set: (theme: Theme, mode: ThemeMode) => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'lavender',
      mode: 'system',
      setTheme: (theme: Theme) => set((state) => ({ ...state, theme })),
      setMode: (mode: ThemeMode) => set((state) => ({ ...state, mode })),
      set: (theme: Theme, mode: ThemeMode) => set((state) => ({ ...state, theme, mode })),
    }),
    {
      name: 'theme',
    }
  )
)
