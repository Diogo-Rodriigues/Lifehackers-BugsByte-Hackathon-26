"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getDailyLog,
  saveDailyLog,
  todayString,
  getProfile,
  getActiveTrip,
} from "@/lib/store"
import type { DailyLog } from "@/lib/types"
import {
  Plus,
  Droplets,
  Footprints,
  Minus,
  Calendar,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getLanguage, t, type Language } from "@/lib/language"
import { apiFetch } from "@/lib/api"

export function MealLogger() {
  const today = todayString()
  const profile = getProfile()
  const activeTrip = getActiveTrip()
  const [lang, setLang] = useState<Language>(getLanguage())
  const [dailyLog, setDailyLog] = useState<DailyLog>(getDailyLog(today))

  // Reload on changes
  useEffect(() => {
    setDailyLog(getDailyLog(today))
  }, [today])

  useEffect(() => {
    setLang(getLanguage())

    const handleLanguageChange = (event: Event) => {
      const customEvent = event as CustomEvent<Language>
      setLang(customEvent.detail)
    }

    window.addEventListener("languageChanged", handleLanguageChange)

    async function refreshDynamicTargets() {
      if (!profile || !activeTrip?.destination) return
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
        // Keep existing values if fetch fails
      }
    }
    refreshDynamicTargets()

    return () => {
      window.removeEventListener("languageChanged", handleLanguageChange)
    }
  }, [today, profile, activeTrip?.destination, dailyLog.steps])

  function updateWater(amount: number) {
    const updated = {
      ...dailyLog,
      waterIntake: Math.max(0, dailyLog.waterIntake + amount),
    }
    saveDailyLog(updated)
    setDailyLog(updated)
  }

  function updateSteps(value: string) {
    const updated = {
      ...dailyLog,
      steps: parseInt(value) || 0,
    }
    saveDailyLog(updated)
    setDailyLog(updated)
  }

  function updateActivity(
    level: "sedentary" | "light" | "moderate" | "active"
  ) {
    const updated = {
      ...dailyLog,
      activityLevel: level,
    }
    saveDailyLog(updated)
    setDailyLog(updated)
  }

  function updateNotes(notes: string) {
    const updated = {
      ...dailyLog,
      activityNotes: notes,
    }
    saveDailyLog(updated)
    setDailyLog(updated)
  }

  const waterPercent = profile
    ? Math.min(100, (dailyLog.waterIntake / (dailyLog.dynamicTargets?.adjustedWaterTarget || profile.waterTarget)) * 100)
    : 0

  const effectiveWaterTarget = dailyLog.dynamicTargets?.adjustedWaterTarget || profile?.waterTarget || 2500

  return (
    <div className="flex flex-col gap-6 px-4 pb-24 pt-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-primary">{t('dailyLog', lang)}</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{today}</span>
        </div>
      </div>

      <Tabs defaultValue="water" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted">
          <TabsTrigger value="water" className="data-[state=active]:bg-card data-[state=active]:text-foreground">{t('water', lang)}</TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-card data-[state=active]:text-foreground">{t('activity', lang)}</TabsTrigger>
        </TabsList>

        {/* Water Tab */}
        <TabsContent value="water" className="mt-4 flex flex-col gap-4">
          <Card className="border-0 bg-card shadow-sm">
            <CardContent className="flex flex-col items-center gap-4 p-6">
              <Droplets className="h-12 w-12 text-secondary" />
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">
                  {dailyLog.waterIntake}
                  <span className="text-base font-normal text-muted-foreground">
                    ml
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('water', lang)}: {effectiveWaterTarget}ml {t('ofTarget', lang)}
                </p>
                {dailyLog.dynamicTargets && (
                  <p className="text-xs text-muted-foreground">
                    {t('adjustedWaterTargetLabel', lang)}
                  </p>
                )}
              </div>
              {/* Progress bar */}
              <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-secondary transition-all duration-300"
                  style={{ width: `${waterPercent}%` }}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateWater(-250)}
                  disabled={dailyLog.waterIntake <= 0}
                >
                  <Minus className="mr-1 h-3 w-3" />
                  250ml
                </Button>
                <Button
                  onClick={() => updateWater(250)}
                  size="sm"
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                >
                  <Plus className="mr-1 h-3 w-3" />
                  250ml
                </Button>
                <Button
                  onClick={() => updateWater(500)}
                  size="sm"
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                >
                  <Plus className="mr-1 h-3 w-3" />
                  500ml
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="mt-4 flex flex-col gap-4">
          <Card className="border-0 bg-card shadow-sm">
            <CardContent className="flex flex-col gap-4 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Footprints className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <Label htmlFor="steps">{t('stepCount', lang)}</Label>
                  <Input
                    id="steps"
                    type="number"
                    placeholder="0"
                    value={dailyLog.steps || ""}
                    onChange={(e) => updateSteps(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label className="mb-2 block">{t('activityLevel', lang)}</Label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    {
                      key: "sedentary",
                      label: t('sedentary', lang),
                      desc: t('deskWork', lang),
                    },
                    {
                      key: "light",
                      label: t('lightActivity', lang),
                      desc: t('walkingTours', lang),
                    },
                    {
                      key: "moderate",
                      label: t('moderate', lang),
                      desc: t('hikingCycling', lang),
                    },
                    {
                      key: "active",
                      label: t('activeLevel', lang),
                      desc: t('sportsIntense', lang),
                    },
                  ] as const
                  ).map((level) => (
                    <button
                      key={level.key}
                      onClick={() => updateActivity(level.key)}
                      className={cn(
                        "flex flex-col items-start gap-0.5 rounded-lg border p-3 text-left transition-colors",
                        dailyLog.activityLevel === level.key
                          ? "border-primary bg-primary/5 text-foreground"
                          : "border-border bg-card text-muted-foreground hover:border-primary/50"
                      )}
                    >
                      <span className="text-sm font-medium">
                        {level.label}
                      </span>
                      <span className="text-[10px]">{level.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="activity-notes">{t('activityNotes', lang)}</Label>
                <Textarea
                  id="activity-notes"
                  placeholder="Walked around the temple district..."
                  value={dailyLog.activityNotes}
                  onChange={(e) => updateNotes(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
