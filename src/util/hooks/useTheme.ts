import { useEffect } from "react"
import { useThemeStore } from "../stores/themeStore"
import { setTheme } from "../theme"

const useTheme = () => {
  const themeStore = useThemeStore()

  // handles system-theme changes
  useEffect(() => {
    const systemThemeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    const handleSystemThemeChange = () => {
      if (themeStore.mode !== 'system') return
      setTheme(themeStore.theme, themeStore.mode)
    }

    systemThemeMediaQuery.addEventListener("change", handleSystemThemeChange)

    return () => {
      systemThemeMediaQuery.removeEventListener("change", handleSystemThemeChange)
    }
  }, [themeStore.mode])

  // handles in app theme change
  useEffect(() => {
    setTheme(themeStore.theme, themeStore.mode)
  }, [themeStore.theme])

  return [{mode: themeStore.mode, color: themeStore.theme}, themeStore.set] as const
}