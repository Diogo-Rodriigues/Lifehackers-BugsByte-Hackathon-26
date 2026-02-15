"use client"

import { useState, useEffect } from "react"
import { getProfile } from "@/lib/store"
import type { UserProfile } from "@/lib/types"
import { Onboarding } from "@/components/onboarding"
import { Dashboard } from "@/components/dashboard"
import { TripPlanning } from "@/components/trip-planning"
import { MealAnalysis } from "@/components/meal-analysis"
import { MealLogger } from "@/components/meal-logger"
import { SettingsPage } from "@/components/settings-page"
import { TripReview } from "@/components/trip-review"
import { BottomNav, type PageId } from "@/components/bottom-nav"

export default function Page() {
  const [currentPage, setCurrentPage] = useState<PageId>("dashboard")
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = getProfile()
    if (saved?.onboardingComplete) {
      setProfile(saved)
    }
  }, [])

  // Handle navigation that refreshes profile (e.g., after logging a meal)
  function handleNavigate(page: PageId) {
    const fresh = getProfile()
    if (fresh) setProfile(fresh)
    setCurrentPage(page)
  }

  function handleOnboardingComplete() {
    const saved = getProfile()
    if (saved) {
      setProfile(saved)
      setCurrentPage("dashboard")
    }
  }

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <h1 className="font-display text-3xl text-primary">NutriFuel</h1>
          <div className="h-1 w-24 animate-pulse rounded-full bg-primary/30" />
        </div>
      </div>
    )
  }

  if (!profile) {
    return <Onboarding onComplete={handleOnboardingComplete} />
  }

  if (currentPage === "onboarding") {
    return (
      <Onboarding
        onComplete={handleOnboardingComplete}
        startAtStep={4}
        initialProfile={profile}
      />
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-md">
        {currentPage === "dashboard" && (
          <Dashboard profile={profile} onNavigate={handleNavigate} />
        )}
        {currentPage === "trip" && <TripPlanning onOpenTripReview={handleNavigate} />}
        {currentPage === "trip-review" && (
          <TripReview profile={profile} onNavigate={handleNavigate} />
        )}
        {currentPage === "analyze" && <MealAnalysis />}
        {currentPage === "log" && <MealLogger />}
        {currentPage === "settings" && <SettingsPage />}
      </div>
      {currentPage !== "trip-review" && (
        <BottomNav currentPage={currentPage} onNavigate={handleNavigate} />
      )}
    </main>
  )
}
