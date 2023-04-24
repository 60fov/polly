const SupportedLanguageList = ['korean', 'japanese', 'spanish'] as const
export type SupportedLanguage = typeof SupportedLanguageList[number]

export type LanguageISO6391 = ReturnType<typeof getISO6391>
export type LanguageBCP47 = ReturnType<typeof getBCP47>


export function isSupportedLanguage(lang: string): lang is SupportedLanguage {
  return SupportedLanguageList.includes(lang as SupportedLanguage)
}

export function getISO6391(lang: string) {
  switch (lang) {
    case "japanese": return "ja"
    case "korean": return "ko"
    case "spanish": return "es"
    case "english": return "en"
    default: return "en"
  }
}

export function getBCP47(lang: string) {
  switch (lang) {
    case "japanese": return "ja-JP"
    case "korean": return "ko-KR"
    case "spanish": return "es-MX"
    case "english": return "en-US"
    default: return "en-US"
  }
}