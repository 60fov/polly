export const themeList = ["lavender", "amber", "aqua", "rose"] as const
export const themeColorList = ['light', 'dark', 'vibrant'] as const
export const themeModeList = ['light', 'dark', 'system'] as const

export type Theme = typeof themeList[number]
export type ThemeMode = typeof themeModeList[number]
export type ThemeColor = typeof themeColorList[number]
export type ThemeObject = Record<ThemeColor, string>

const themeMap: Record<Theme, ThemeObject> = {
  lavender: {
    light: "245 218 255",
    vibrant: "223 155 248",
    dark: "33 14 39"
  },
  aqua: {
    light: "226 253 247",
    vibrant: "81 228 201",
    dark: "13 31 28"
  },
  amber: {
    light: "251 231 213",
    vibrant: "251 172 99",
    dark: "34 18 9"
  },
  rose: {
    light: "251 218 218",
    vibrant: "246 142 142",
    dark: "32 4 4"
  },
  // neutral: {
  //   light: "",
  //   vibrant: "",
  //   dark: ""
  // },
}

const prefersDarkTheme = () => window.matchMedia("(prefers-color-scheme: dark)").matches

export function setTheme(theme: Theme, mode: ThemeMode) {
  const modeName = mode === 'system' ? (prefersDarkTheme() ? 'dark' : 'light') : mode
  const colors = themeMap[theme]
  console.log(theme, mode, colors)

  document.documentElement.style.setProperty("--color-light", colors.light);
  document.documentElement.style.setProperty("--color-vibrant", colors.vibrant);
  document.documentElement.style.setProperty("--color-dark", colors.dark);

  if (modeName === 'dark') {
    document.documentElement.style.setProperty("--color-front", colors.light);
    document.documentElement.style.setProperty("--color-mid", colors.vibrant);
    document.documentElement.style.setProperty("--color-back", colors.dark);
  } else {
    document.documentElement.style.setProperty("--color-front", colors.light);
    document.documentElement.style.setProperty("--color-mid", colors.dark);
    document.documentElement.style.setProperty("--color-back", colors.vibrant);
  }
}

export function isTheme(theme: string): theme is Theme {
  return themeList.includes(theme as Theme)
}

export function isThemeMode(mode: string): mode is ThemeMode {
  return themeModeList.includes(mode as ThemeMode)
}