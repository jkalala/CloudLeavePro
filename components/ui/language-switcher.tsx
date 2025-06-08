"use client"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Globe } from "lucide-react"
import type { Language } from "@/lib/i18n"

interface LanguageSwitcherProps {
  currentLanguage: Language
  onLanguageChange: (language: Language) => void
  variant?: "button" | "select"
}

export function LanguageSwitcher({ currentLanguage, onLanguageChange, variant = "select" }: LanguageSwitcherProps) {
  const languages = [
    { code: "en" as Language, name: "English", flag: "🇺🇸" },
    { code: "pt" as Language, name: "Português", flag: "🇧🇷" },
    { code: "fr" as Language, name: "Français", flag: "🇫🇷" },
  ]

  if (variant === "button") {
    return (
      <div className="flex items-center space-x-1">
        {languages.map((lang) => (
          <Button
            key={lang.code}
            variant={currentLanguage === lang.code ? "default" : "ghost"}
            size="sm"
            onClick={() => onLanguageChange(lang.code)}
            className="px-2 py-1 h-8"
          >
            <span className="mr-1">{lang.flag}</span>
            <span className="hidden sm:inline">{lang.name}</span>
          </Button>
        ))}
      </div>
    )
  }

  return (
    <Select value={currentLanguage} onValueChange={onLanguageChange}>
      <SelectTrigger className="w-40">
        <div className="flex items-center space-x-2">
          <Globe className="h-4 w-4" />
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <div className="flex items-center space-x-2">
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
