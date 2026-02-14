"use client"

import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ProgressRing } from "@/components/progress-ring"
import { getDailyLog, todayString, getActiveTrip } from "@/lib/store"
import type { UserProfile } from "@/lib/types"
import type { PageId } from "@/components/bottom-nav"
import { Droplets, Footprints, Flame, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface DashboardProps {
  profile: UserProfile
  onNavigate: (page: PageId) => void
}

export function Dashboard({ profile, onNavigate }: DashboardProps) {
  const today = todayString()
  const dailyLog = getDailyLog(today)
  const activeTrip = getActiveTrip()

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
    profile.dailyCalorieTarget - totals.calories
  )

  const mealCount = dailyLog.meals.length
  const hasOffPlanMeal = dailyLog.meals.some((m) => m.isOffPlan)

  return (
    <div className="flex flex-col gap-6 px-4 pb-24 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="NutriFuel" width={32} height={32} />
          <h1 className="font-display text-2xl text-primary">Nutrifuel</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Welcome back, {profile.name || "Traveler"}
        </p>
        {activeTrip && (
          <div className="rounded-full bg-accent px-3 py-1">
            <span className="text-xs font-medium text-accent-foreground">
              {activeTrip.destination}
            </span>
          </div>
        )}
      </div>

      {/* Main Calorie Ring */}
      <Card className="border-0 bg-card shadow-sm">
        <CardContent className="flex flex-col items-center gap-4 p-6">
          <ProgressRing
            value={totals.calories}
            max={profile.dailyCalorieTarget}
            size={160}
            strokeWidth={12}
            color="hsl(var(--primary))"
            label={`${totals.calories}`}
            sublabel={`/ ${profile.dailyCalorieTarget} kcal`}
          />
          <div className="flex items-center gap-2 text-sm">
            <Flame className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">
              {caloriesRemaining} kcal remaining
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Macro Progress */}
      <div className="grid grid-cols-3 gap-3">
        <MacroCard
          label="Protein"
          value={totals.protein}
          max={profile.macros.protein}
          color="hsl(var(--chart-1))"
          unit="g"
        />
        <MacroCard
          label="Carbs"
          value={totals.carbs}
          max={profile.macros.carbs}
          color="hsl(var(--chart-2))"
          unit="g"
        />
        <MacroCard
          label="Fat"
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
              <p className="text-xs text-muted-foreground">Water</p>
              <p className="text-lg font-semibold text-foreground">
                {dailyLog.waterIntake}
                <span className="text-xs text-muted-foreground font-normal">
                  /{profile.waterTarget}ml
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Footprints className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Steps</p>
              <p className="text-lg font-semibold text-foreground">
                {dailyLog.steps.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Meals */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            Today{"'"}s Meals
          </h2>
          <span className="text-xs text-muted-foreground">
            {mealCount} logged
          </span>
        </div>
        {mealCount === 0 ? (
          <Card className="border border-dashed border-primary/30 bg-card shadow-none">
            <CardContent className="flex flex-col items-center gap-2 p-6">
              <p className="text-sm text-muted-foreground">
                No meals logged yet today
              </p>
              <button
                onClick={() => onNavigate("log")}
                className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Log Your First Meal
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
                          Off-plan
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
                Plan Adjusted
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                You had an off-plan meal. Your remaining meals have been
                recalculated to keep you on track.
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
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-sm font-semibold text-foreground">
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
