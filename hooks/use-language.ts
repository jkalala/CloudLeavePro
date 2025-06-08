"use client"

import { useState, useEffect, createContext, useContext } from "react"
import type { Language, Translations } from "@/lib/i18n"
import { getTranslation } from "@/lib/i18n"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: Translations
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

export function useLanguageState() {
  const [language, setLanguageState] = useState<Language>("en")
  const [t, setTranslations] = useState<Translations>(getTranslation("en"))

  useEffect(() => {
    // Load language from localStorage or business config
    const savedLanguage = localStorage.getItem("cloudleave-language") as Language
    const businessConfig = localStorage.getItem("business-config-adpa")

    let initialLanguage: Language = "en"

    if (savedLanguage) {
      initialLanguage = savedLanguage
    } else if (businessConfig) {
      try {
        const config = JSON.parse(businessConfig)
        initialLanguage = config.language || "en"
      } catch (e) {
        // Use default
      }
    }

    setLanguageState(initialLanguage)
    setTranslations(getTranslation(initialLanguage))
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    setTranslations(getTranslation(lang))
    localStorage.setItem("cloudleave-language", lang)
  }

  return { language, setLanguage, t }
}

export { LanguageContext }
