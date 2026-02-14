"use client"

import { useState, useEffect } from "react"
import {
  Home,
  Plane,
  PlusCircle,
  ClipboardList,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getLanguage, t, type Language } from "@/lib/language"

const navItems = [
  { id: "dashboard" as const, labelKey: "navHome" as const, icon: Home },
  { id: "trip" as const, labelKey: "navTrip" as const, icon: Plane },
  { id: "analyze" as const, labelKey: "navAdd" as const, icon: PlusCircle },
  { id: "log" as const, labelKey: "navLog" as const, icon: ClipboardList },
  { id: "settings" as const, labelKey: "navSettings" as const, icon: Settings },
]

export type PageId = (typeof navItems)[number]["id"] | "onboarding"

interface BottomNavProps {
  currentPage: PageId
  onNavigate: (page: PageId) => void
}

export function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  const [lang, setLang] = useState<Language>(getLanguage())

  useEffect(() => {
    // Update language state when component mounts
    setLang(getLanguage())

    // Listen for language changes
    const handleLanguageChange = (event: Event) => {
      const customEvent = event as CustomEvent<Language>
      setLang(customEvent.detail)
    }

    window.addEventListener('languageChanged', handleLanguageChange)

    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange)
    }
  }, [])
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card safe-bottom">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-1">
        {navItems.map((item) => {
          const isActive = currentPage === item.id
          const label = t(item.labelKey, lang)
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg px-3 py-2 text-xs transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon
                className={cn(
                  "h-5 w-5",
                  isActive && "drop-shadow-sm"
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={cn(isActive && "font-medium")}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
