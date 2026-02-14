"use client"

import {
  Home,
  Plane,
  Camera,
  ClipboardList,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { id: "dashboard" as const, label: "Home", icon: Home },
  { id: "trip" as const, label: "Trip", icon: Plane },
  { id: "analyze" as const, label: "Analyze", icon: Camera },
  { id: "log" as const, label: "Log", icon: ClipboardList },
  { id: "settings" as const, label: "Settings", icon: Settings },
]

export type PageId = (typeof navItems)[number]["id"] | "onboarding"

interface BottomNavProps {
  currentPage: PageId
  onNavigate: (page: PageId) => void
}

export function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card safe-bottom">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-1">
        {navItems.map((item) => {
          const isActive = currentPage === item.id
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
              aria-label={item.label}
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
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
