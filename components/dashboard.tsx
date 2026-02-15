"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ProgressRing } from "@/components/progress-ring"
import { getDailyLog, todayString, getActiveTrip, saveDailyLog } from "@/lib/store"
import type { DailyLog, UserProfile } from "@/lib/types"
import type { PageId } from "@/components/bottom-nav"
import { Droplets, Footprints, Flame, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { getLanguage, t, type Language } from "@/lib/language"
import { apiFetch } from "@/lib/api"

const DESTINATION_FLAGS: Record<string, string> = {
  Japan: "🇯🇵",
  Thailand: "🇹🇭",
  Mexico: "🇲🇽",
  Italy: "🇮🇹",
  India: "🇮🇳",
  France: "🇫🇷",
  Morocco: "🇲🇦",
  Peru: "🇵🇪",
  "South Korea": "🇰🇷",
  Spain: "🇪🇸",
  Turkey: "🇹🇷",
  Vietnam: "🇻🇳",
  Greece: "🇬🇷",
  Brazil: "🇧🇷",
  Colombia: "🇨🇴",
}

interface DashboardProps {
  profile: UserProfile
  onNavigate: (page: PageId) => void
}

export function Dashboard({ profile, onNavigate }: DashboardProps) {
  const today = todayString()
  const [dailyLog, setDailyLog] = useState<DailyLog>(getDailyLog(today))
  const activeTrip = getActiveTrip()
  const [lang, setLang] = useState<Language>(getLanguage())

  const adjustedWaterTarget = dailyLog.dynamicTargets?.adjustedWaterTarget || profile.waterTarget
  const adjustedCalorieTarget = dailyLog.dynamicTargets?.adjustedCalorieTarget || profile.dailyCalorieTarget

  useEffect(() => {
    setDailyLog(getDailyLog(today))
  }, [today])

  useEffect(() => {
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

  useEffect(() => {
    async function refreshDynamicTargets() {
      if (!activeTrip?.destination) return
      const currentLog = getDailyLog(today)
      try {
        const res = await apiFetch("/api/dynamic-targets", {
          destination: activeTrip.destination,
          tripDate: activeTrip.arrivalDate || activeTrip.departureDate,
          profile,
          dailyLog: currentLog,
          selectedDishes: activeTrip.selectedDishes || [],
        })
        if (!res.ok) return
        const data = await res.json()
        const latestLog = getDailyLog(today)
        const updated: DailyLog = {
          ...latestLog,
          weather: data.weather,
          dynamicTargets: data.dynamicTargets,
        }
        saveDailyLog(updated)
        setDailyLog(updated)
      } catch {
        // Silent fallback to persisted/base values
      }
    }

    refreshDynamicTargets()
  }, [today, activeTrip?.destination, profile])

  const totals = useMemo(() => {
    return dailyLog.meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
        carbs: acc.carbs + meal.carbs,
        fat: acc.fat + meal.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    )
  }, [dailyLog.meals])

  const caloriesRemaining = Math.max(
    0,
    adjustedCalorieTarget - totals.calories
  )

  const mealCount = dailyLog.meals.length
  const hasOffPlanMeal = dailyLog.meals.some((m) => m.isOffPlan)

  function quickLogWater() {
    const updated: DailyLog = {
      ...dailyLog,
      waterIntake: dailyLog.waterIntake + 250,
    }
    saveDailyLog(updated)
    setDailyLog(updated)
  }

  const shouldShowHydrationNotice = Boolean(
    dailyLog.dynamicTargets?.needsHydrationAlert &&
      dailyLog.dynamicTargets.adjustedWaterTarget > dailyLog.dynamicTargets.baseWaterTarget &&
      dailyLog.waterIntake < dailyLog.dynamicTargets.adjustedWaterTarget
  )

  const hydrationMessage = (() => {
    const kind = dailyLog.dynamicTargets?.hydrationAlertKind
    const seasonal = dailyLog.dynamicTargets?.hydrationAlertSeasonal
    if (kind === "heat") return t('hydrationAlertByHeat', lang)
    if (kind === "activity") return t('hydrationAlertByActivity', lang)
    if (kind === "mixed" && seasonal) return t('hydrationAlertBySeasonActivity', lang)
    if (kind === "mixed") return t('hydrationAlertByMixed', lang)
    return t('hydrationAlertGeneric', lang)
  })()

  return (
    <div className="flex flex-col gap-6 px-4 pb-24 pt-4">
      {/* Header */}
      <div className="flex flex-col items-center gap-3">
        <h1 className="font-display text-2xl text-[#38b6ff]">NutriFuel</h1>
        {activeTrip && (
          <div className="rounded-full bg-accent px-4 py-1.5">
            <span className="text-sm font-medium text-accent-foreground">
              {DESTINATION_FLAGS[activeTrip.destination] || "🌍"} {activeTrip.destination}
            </span>
          </div>
        )}
        <p className="text-sm text-muted-foreground">
          {t('welcomeBack', lang)} {profile.name || t('traveler', lang)}
        </p>
      </div>

      {/* Main Calorie Ring */}
      <Card className="border-0 bg-card shadow-sm">
        <CardContent className="flex flex-col items-center gap-4 p-6">
          <ProgressRing
            value={totals.calories}
            max={adjustedCalorieTarget}
            size={160}
            strokeWidth={12}
            color="hsl(var(--primary))"
            label={`${totals.calories}`}
            sublabel={`/ ${adjustedCalorieTarget} kcal`}
          />
          <div className="flex items-center gap-2 text-sm">
            <Flame className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">
              {caloriesRemaining} {t('kcalRemaining', lang)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Macro Progress */}
      <div className="grid grid-cols-3 gap-3">
        <MacroCard
          label={t('protein', lang)}
          value={totals.protein}
          max={profile.macros.protein}
          color="hsl(var(--chart-1))"
          unit="g"
        />
        <MacroCard
          label={t('carbs', lang)}
          value={totals.carbs}
          max={profile.macros.carbs}
          color="hsl(var(--chart-2))"
          unit="g"
        />
        <MacroCard
          label={t('fat', lang)}
          value={totals.fat}
          max={profile.macros.fat}
          color="hsl(var(--chart-3))"
          unit="g"
        />
      </div>

      {/* Water & Steps */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-0 bg-card shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/20">
              <Droplets className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('water', lang)}</p>
              <p className="text-2xl font-bold text-foreground">
                {dailyLog.waterIntake}
                <span className="text-xs text-muted-foreground font-normal">
                  /{adjustedWaterTarget}ml
                </span>
              </p>
              {dailyLog.dynamicTargets && (
                <p className="text-[10px] text-muted-foreground">
                  {t('adjustedWaterTargetLabel', lang)}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Footprints className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('steps', lang)}</p>
              <p className="text-2xl font-bold text-foreground">
                {dailyLog.steps.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {shouldShowHydrationNotice && (
        <Card className="border border-secondary/40 bg-secondary/10 shadow-none">
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-foreground">{t('hydrationAlertTitle', lang)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {hydrationMessage}
            </p>
            <p className="mt-1 text-xs text-foreground">
              {t('adjustedWaterTargetLabel', lang)} {adjustedWaterTarget}ml
            </p>
            <button
              onClick={quickLogWater}
              className="mt-3 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              {t('log250ml', lang)}
            </button>
          </CardContent>
        </Card>
      )}

      {/* Today's Meals */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            {t('todaysMeals', lang)}
          </h2>
          <span className="text-sm text-muted-foreground">
            {mealCount} {t('logged', lang)}
          </span>
        </div>
        {mealCount === 0 ? (
          <Card className="border border-dashed border-primary/30 bg-card shadow-none">
            <CardContent className="flex flex-col items-center gap-2 p-6">
              <p className="text-sm text-muted-foreground">
                {t('noMealsYet', lang)}
              </p>
              <button
                onClick={() => onNavigate("log")}
                className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                {t('logFirstMeal', lang)}
              </button>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {dailyLog.meals.map((meal) => (
              <Card
                key={meal.id}
                className={cn(
                  "border-0 bg-card shadow-sm",
                  meal.isOffPlan && "border border-destructive/20"
                )}
              >
                <CardContent className="flex items-center justify-between p-3">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {meal.name}
                      </span>
                      {meal.isOffPlan && (
                        <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">
                          {t('offPlan', lang)}
                        </span>
                      )}
                    </div>
                    <span className="text-xs capitalize text-muted-foreground">
                      {meal.type} - {meal.time}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {meal.calories} kcal
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Adaptation Alert */}
      {hasOffPlanMeal && (
        <Card className="border border-secondary/30 bg-accent/50 shadow-none">
          <CardContent className="flex items-start gap-3 p-4">
            <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
            <div>
              <p className="text-sm font-medium text-foreground">
                {t('planAdjusted', lang)}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {t('planAdjustedDesc', lang)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  )
}

function MacroCard({
  label,
  value,
  max,
  color,
  unit,
}: {
  label: string
  value: number
  max: number
  color: string
  unit: string
}) {
  return (
    <Card className="border-0 bg-card shadow-sm">
      <CardContent className="flex flex-col items-center gap-2 p-3">
        <ProgressRing
          value={value}
          max={max}
          size={56}
          strokeWidth={5}
          color={color}
        />
        <div className="text-center">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-base font-semibold text-foreground">
            {value}
            <span className="text-xs text-muted-foreground font-normal">
              /{max}
              {unit}
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
