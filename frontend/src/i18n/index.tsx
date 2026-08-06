import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { dict, type DictKey } from "@/i18n/dict"

export type Lang = "vi" | "en"

/** A string that exists in both languages. */
export interface L {
  vi: string
  en: string
}

const STORAGE_KEY = "hexa.lang"

// Hexa AI ships English-only. The bilingual data layer is retained so the
// CMS schema stays intact, but the UI is locked to English.
function initialLang(): Lang {
  return "en"
}

interface LangContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  toggle: () => void
  /** Translate a chrome/UI key. */
  t: (key: DictKey) => string
  /** Pick the active-language value from a localized object. */
  tr: (value: L) => string
}

const LangContext = createContext<LangContextValue | null>(null)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang)
    document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback((next: Lang) => setLangState(next), [])
  const toggle = useCallback(() => setLangState((l) => (l === "vi" ? "en" : "vi")), [])
  const t = useCallback((key: DictKey) => dict[key]?.[lang] ?? key, [lang])
  const tr = useCallback((value: L) => value[lang], [lang])

  const value = useMemo<LangContextValue>(
    () => ({ lang, setLang, toggle, t, tr }),
    [lang, setLang, toggle, t, tr],
  )

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLang(): LangContextValue {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error("useLang must be used within LangProvider")
  return ctx
}
