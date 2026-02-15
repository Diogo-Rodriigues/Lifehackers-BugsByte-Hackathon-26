"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle2, CircleDashed, Loader2, Send, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { clearActiveTrip, getActiveTrip, getDailyLogs, getDailyLogsInRange, saveTrip } from "@/lib/store"
import type { PageId } from "@/components/bottom-nav"
import type { Trip, TripDietAnalysis, UserProfile, DailyLog, NutriumSyncStatus } from "@/lib/types"
import { getLanguage, t } from "@/lib/language"
import Image from "next/image"
import { DESTINATION_IMAGES } from "@/lib/constants"

interface TripReviewProps {
  profile: UserProfile
  onNavigate: (page: PageId) => void
}

function enumerateDates(startDate: string, endDate: string): string[] {
  const dates: string[] = []
  const start = new Date(`${startDate}T00:00:00`)
  const end = new Date(`${endDate}T00:00:00`)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    return [startDate]
  }

  const cursor = new Date(start)
  while (cursor <= end) {
    dates.push(cursor.toISOString().split("T")[0])
    cursor.setDate(cursor.getDate() + 1)
  }
  return dates.length > 0 ? dates : [startDate]
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function round(value: number) {
  return Math.round(value)
}

function hasMeaningfulData(log: DailyLog) {
  return (
    (log.meals?.length || 0) > 0 ||
    Number(log.waterIntake || 0) > 0 ||
    Number(log.steps || 0) > 0
  )
}

function buildTripAnalysis(trip: Trip, profile: UserProfile, lang: ReturnType<typeof getLanguage>): TripDietAnalysis {
  const rangeStart = trip.arrivalDate || trip.departureDate || new Date().toISOString().split("T")[0]
  const rangeEnd = trip.returnDate || trip.arrivalDate || rangeStart
  const inRangeDates = enumerateDates(rangeStart, rangeEnd)
  const inRangeLogs = getDailyLogsInRange(rangeStart, rangeEnd)
  const inRangeMeaningful = inRangeLogs.filter(hasMeaningfulData)
  const fallbackLogs = getDailyLogs().filter(hasMeaningfulData)
  const useInRange = inRangeMeaningful.length > 0
  const logs = useInRange ? inRangeLogs : fallbackLogs
  const allDates = useInRange
    ? inRangeDates
    : logs.map((log) => log.date).sort((a, b) => a.localeCompare(b))
  const logsByDate = new Map<string, DailyLog>(logs.map((log) => [log.date, log]))
  const isPt = lang === "pt-PT" || lang === "pt-BR"

  let totalMeals = 0
  let totalCalories = 0
  let totalWater = 0
  let totalSteps = 0
  let offPlanMeals = 0
  let hydrationTargetHitDays = 0
  let hydrationLowDays = 0
  let excessCalorieDays = 0

  for (const date of allDates) {
    const log = logsByDate.get(date)
    const meals = log?.meals || []
    const dayCalories = meals.reduce((acc, meal) => acc + Number(meal.calories || 0), 0)
    const dayWater = Number(log?.waterIntake || 0)
    const daySteps = Number(log?.steps || 0)
    const dayOffPlan = meals.filter((meal) => meal.isOffPlan).length
    const waterTarget = Number(log?.dynamicTargets?.adjustedWaterTarget || profile.waterTarget || 2500)
    const calorieTarget = Number(log?.dynamicTargets?.adjustedCalorieTarget || profile.dailyCalorieTarget || 2000)

    totalMeals += meals.length
    totalCalories += dayCalories
    totalWater += dayWater
    totalSteps += daySteps
    offPlanMeals += dayOffPlan

    if (dayWater >= waterTarget) hydrationTargetHitDays += 1
    else hydrationLowDays += 1

    if (dayCalories > calorieTarget * 1.15) excessCalorieDays += 1
  }

  const daysAnalyzed = Math.max(1, allDates.length || logs.length)
  const avgCaloriesPerDay = round(totalCalories / daysAnalyzed)
  const avgWaterPerDay = round(totalWater / daysAnalyzed)
  const avgStepsPerDay = round(totalSteps / daysAnalyzed)

  const offPlanPenalty = Math.min(30, offPlanMeals * 3)
  const hydrationPenalty = Math.min(35, hydrationLowDays * 5)
  const excessPenalty = Math.min(20, excessCalorieDays * 4)
  const adherenceScore = clamp(100 - offPlanPenalty - hydrationPenalty - excessPenalty, 0, 100)

  const highlights: string[] = []
  if (hydrationTargetHitDays / daysAnalyzed >= 0.7) {
    highlights.push(
      isPt
        ? "Boa consistência de hidratação durante a viagem."
        : "Strong hydration consistency across the trip."
    )
  } else {
    highlights.push(
      isPt
        ? "A hidratação pode melhorar em vários dias da viagem."
        : "Hydration can be improved on several trip days."
    )
  }

  if (avgStepsPerDay >= 9000) {
    highlights.push(
      isPt
        ? "Nível de atividade elevado durante a viagem."
        : "High activity level maintained during the trip."
    )
  }

  if (offPlanMeals <= Math.max(1, Math.floor(totalMeals * 0.2))) {
    highlights.push(
      isPt
        ? "Boa adesão ao plano alimentar definido."
        : "Good adherence to the planned meals."
    )
  } else {
    highlights.push(
      isPt
        ? "Houve várias refeições fora do plano que podem ser ajustadas."
        : "Several off-plan meals were logged and may need adjustment."
    )
  }

  if (highlights.length < 2) {
    highlights.push(
      isPt
        ? "A viagem mostra dados suficientes para otimizar o plano futuro."
        : "Trip data is sufficient to optimize your next plan."
    )
  }

  return {
    tripId: trip.id,
    generatedAt: new Date().toISOString(),
    daysAnalyzed,
    totalMeals,
    avgCaloriesPerDay,
    avgWaterPerDay,
    avgStepsPerDay,
    offPlanMeals,
    hydrationTargetHitDays,
    adherenceScore,
    highlights: highlights.slice(0, 4),
  }
}

export function TripReview({ profile, onNavigate }: TripReviewProps) {
  const [trip] = useState<Trip | null>(getActiveTrip())
  const [stage, setStage] = useState(0)
  const [sendStatus, setSendStatus] = useState<NutriumSyncStatus["status"]>("not-sent")
  const [sendMessage, setSendMessage] = useState("")
  const [syncId, setSyncId] = useState("")
  const [finishing, setFinishing] = useState(false)
  const lang = getLanguage()

  const analysis = useMemo(() => {
    if (!trip) return null
    return buildTripAnalysis(trip, profile, lang)
  }, [trip, profile, lang])

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 600),
      setTimeout(() => setStage(2), 1300),
      setTimeout(() => setStage(3), 2100),
    ]
    return () => timers.forEach((timer) => clearTimeout(timer))
  }, [])

  async function handleSendNutrium() {
    if (!trip || !analysis || sendStatus === "sending") return

    setSendStatus("sending")
    setSendMessage("")

    try {
      const response = await fetch("/api/nutrium/send-trip-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId: trip.id,
          profile: {
            name: profile.name,
            age: profile.age,
            goal: profile.goal,
            dailyCalorieTarget: profile.dailyCalorieTarget,
            waterTarget: profile.waterTarget,
          },
          analysis,
        }),
      })

      if (!response.ok) throw new Error("Failed to send")
      const data = await response.json()
      setSendStatus("sent")
      setSyncId(String(data?.syncId || ""))
      setSendMessage(String(data?.message || t("nutriumQueuedReview", lang)))
    } catch {
      setSendStatus("failed")
      setSendMessage(t("nutriumSendFailed", lang))
    }
  }

  function handleFinishTrip() {
    if (!trip || !analysis || sendStatus !== "sent") return
    setFinishing(true)

    const now = new Date().toISOString()
    const updatedTrip: Trip = {
      ...trip,
      status: "completed",
      completedAt: now,
      postTripAnalysis: analysis,
      nutriumSync: {
        status: "sent",
        lastAttemptAt: now,
        lastSentAt: now,
        syncId,
        message: sendMessage || t("nutriumQueuedReview", lang),
      },
    }

    saveTrip(updatedTrip)
    clearActiveTrip()
    onNavigate("dashboard")
  }

  if (!trip || !analysis) {
    return (
      <div className="min-h-screen px-4 py-6">
        <Card className="border-0 bg-card shadow-sm">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">{t("noTripPlanned", lang)}</p>
            <Button className="mt-4 w-full" onClick={() => onNavigate("dashboard")}>
              {t("backToHome", lang)}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const stageKeys = [
    "analyzingTripStageIntake",
    "analyzingTripStageHydration",
    "analyzingTripStageAdherence",
  ] as const

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <div className="mx-auto flex max-w-md flex-col gap-4">
        <button
          onClick={() => onNavigate("trip")}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          disabled={finishing}
        >
          <ArrowLeft className="h-4 w-4" />
          {t("back", lang)}
        </button>

        <Card className="border-0 bg-card shadow-sm overflow-hidden">
          {DESTINATION_IMAGES[trip.destination] ? (
            <>
              <div className="relative h-32 w-full">
                <Image
                  src={DESTINATION_IMAGES[trip.destination]}
                  alt={trip.destination}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-5">
                  <div className="inline-block px-3 py-1.5 rounded-md bg-white/95 backdrop-blur-md shadow-lg">
                    <h1 className="text-2xl font-bold text-gray-900 mb-0.5">
                      {trip.destination}
                    </h1>
                    <p className="text-xs text-gray-600 font-medium">
                      {trip.arrivalDate || trip.departureDate} - {(trip as any).returnDate || trip.arrivalDate}
                    </p>
                  </div>
                </div>
              </div>
              <CardContent className="p-5">
                <h2 className="text-xl font-semibold text-foreground">{t("tripReviewTitle", lang)}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{t("tripReviewSubtitle", lang)}</p>
              </CardContent>
            </>
          ) : (
            <CardContent className="p-5">
              <h1 className="text-xl font-semibold text-foreground">{t("tripReviewTitle", lang)}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{t("tripReviewSubtitle", lang)}</p>
              <Badge variant="outline" className="mt-3 text-primary border-primary/30">
                {trip.destination}
              </Badge>
            </CardContent>
          )}
        </Card>

        <Card className="border-0 bg-card shadow-sm">
          <CardContent className="p-5">
            <div className="space-y-3">
              {stageKeys.map((key, idx) => {
                const currentIndex = idx + 1
                const isDone = stage > currentIndex
                const isCurrent = stage === currentIndex
                return (
                  <div
                    key={key}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border px-3 py-2",
                      isDone ? "border-green-500/30 bg-green-500/5" : "border-border"
                    )}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : isCurrent ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <CircleDashed className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm text-foreground">{t(key, lang)}</span>
                  </div>
                )
              })}
            </div>

            {stage >= 3 && (
              <div className="mt-5 space-y-4 border-t border-border pt-4">
                <div className="rounded-lg bg-primary/10 p-4">
                  <p className="text-xs text-muted-foreground">{t("tripScore", lang)}</p>
                  <p className="text-3xl font-bold text-primary">{analysis.adherenceScore}/100</p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-md bg-muted/40 p-2">
                    <p className="text-[10px] text-muted-foreground">kcal/day</p>
                    <p className="text-sm font-semibold text-foreground">{analysis.avgCaloriesPerDay}</p>
                  </div>
                  <div className="rounded-md bg-muted/40 p-2">
                    <p className="text-[10px] text-muted-foreground">water/day</p>
                    <p className="text-sm font-semibold text-foreground">{analysis.avgWaterPerDay}ml</p>
                  </div>
                  <div className="rounded-md bg-muted/40 p-2">
                    <p className="text-[10px] text-muted-foreground">steps/day</p>
                    <p className="text-sm font-semibold text-foreground">{analysis.avgStepsPerDay}</p>
                  </div>
                </div>

                <div>
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Sparkles className="h-4 w-4 text-primary" />
                    {t("tripHighlights", lang)}
                  </p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {analysis.highlights.map((item, idx) => (
                      <li key={`${item}-${idx}`}>• {item}</li>
                    ))}
                  </ul>
                </div>

                {sendStatus === "sent" ? (
                  <div className="rounded-lg border border-green-500/40 bg-green-500/10 p-3">
                    <p className="text-sm font-semibold text-green-700">{t("nutriumSendSuccess", lang)}</p>
                    <p className="text-xs text-green-700/90">{sendMessage || t("nutriumQueuedReview", lang)}</p>
                    {syncId && <p className="mt-1 text-[11px] text-green-700/80">ID: {syncId}</p>}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button
                      onClick={handleSendNutrium}
                      disabled={sendStatus === "sending"}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {sendStatus === "sending" ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t("sendingToNutrium", lang)}
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          {t("sendToNutrium", lang)}
                        </>
                      )}
                    </Button>
                    {sendStatus === "failed" && (
                      <p className="text-xs text-red-600">{sendMessage || t("nutriumSendFailed", lang)}</p>
                    )}
                  </div>
                )}

                <Button
                  onClick={handleFinishTrip}
                  disabled={sendStatus !== "sent" || finishing}
                  variant="secondary"
                  className="w-full"
                >
                  {finishing ? t("tripCompleted", lang) : t("finishTrip", lang)}
                </Button>

                <button
                  onClick={() => onNavigate("dashboard")}
                  className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
                  disabled={finishing}
                >
                  {t("backToHome", lang)}
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
