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
import { BottomNav, type PageId } from "@/components/bottom-nav"
import { SplashScreen } from "@/components/splash-screen"
import { WelcomeScreen } from "@/components/welcome-screen"

export default function Page() {
  const [currentPage, setCurrentPage] = useState<PageId>("dashboard")
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [mounted, setMounted] = useState(false)
  const [showSplash, setShowSplash] = useState(true)
  const [showWelcome, setShowWelcome] = useState(false)
  const [startOnboardingAtStep, setStartOnboardingAtStep] = useState<number | null>(null)

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
    setStartOnboardingAtStep(null) // Reset onboarding step state
  }

  if (!mounted || showSplash) {
    return <SplashScreen onComplete={() => {
      setShowSplash(false)
      // Only show welcome screen if no profile exists
      const saved = getProfile()
      if (!saved?.onboardingComplete) {
        setShowWelcome(true)
      }
    }} />
  }

  if (showWelcome) {
    return (
      <WelcomeScreen
        onStartFresh={() => setShowWelcome(false)}
        onPlanImported={() => {
          setShowWelcome(false)
          setStartOnboardingAtStep(4) // Start at trip details step
        }}
      />
    )
  }

  if (!profile || startOnboardingAtStep !== null) {
    return <Onboarding 
      onComplete={handleOnboardingComplete} 
      onBack={() => {
        setShowWelcome(true)
        setStartOnboardingAtStep(null)
      }}
      initialStep={startOnboardingAtStep || 0}
    />
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-md">
        {currentPage === "dashboard" && (
          <Dashboard profile={profile} onNavigate={handleNavigate} />
        )}
        {currentPage === "trip" && <TripPlanning />}
        {currentPage === "analyze" && <MealAnalysis />}
        {currentPage === "log" && <MealLogger />}
        {currentPage === "settings" && <SettingsPage />}
      </div>
      <BottomNav currentPage={currentPage} onNavigate={handleNavigate} />
    </main>
  )
}
