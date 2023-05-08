import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SupportedLanguage } from '../langauge'

interface SettingsStore {
  language: SupportedLanguage
  setLanguage: (language: SupportedLanguage) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      language: 'korean',
      setLanguage: (language: SupportedLanguage) => set((state) => ({ ...state, language })),
    }),
    {
      name: 'settings',
    }
  )
)