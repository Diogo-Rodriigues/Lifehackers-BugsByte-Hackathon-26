"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { getDailyLog, todayString } from "@/lib/store"
import type { DailyLog } from "@/lib/types"
import { Droplets, Footprints, Utensils, Calendar } from "lucide-react"
import { getLanguage, t, type Language } from "@/lib/language"

export function MealLogger() {
  const [selectedDate, setSelectedDate] = useState(todayString())
  const [dailyLog, setDailyLog] = useState<DailyLog>(getDailyLog(selectedDate))
  const [lang, setLang] = useState<Language>(getLanguage())

  useEffect(() => {
    setDailyLog(getDailyLog(selectedDate))
  }, [selectedDate])

  useEffect(() => {
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

  const totalCalories = dailyLog.meals.reduce((sum, meal) => sum + meal.calories, 0)
  const totalProtein = dailyLog.meals.reduce((sum, meal) => sum + meal.protein, 0)
  const totalCarbs = dailyLog.meals.reduce((sum, meal) => sum + meal.carbs, 0)
  const totalFat = dailyLog.meals.reduce((sum, meal) => sum + meal.fat, 0)

  return (
    <div className="flex flex-col gap-6 px-4 pb-24 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-[#38b6ff]">{t('dailyLog', lang)}</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {selectedDate === todayString() ? "Today" : selectedDate}
        </div>
      </div>

      {/* Daily Summary */}
      <Card className="border-0 bg-gradient-to-br from-primary/5 to-secondary/5 shadow-sm">
        <CardContent className="p-4">
          <h2 className="mb-3 text-base font-semibold text-foreground">{t('dailySummary', lang)}</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-card p-3">
              <p className="text-xs text-muted-foreground">{t('calories', lang)}</p>
              <p className="text-2xl font-bold text-foreground">{totalCalories}</p>
              <p className="text-xs text-muted-foreground">kcal</p>
            </div>
            <div className="rounded-lg bg-card p-3">
              <p className="text-xs text-muted-foreground">{t('protein', lang)}</p>
              <p className="text-2xl font-bold text-foreground">{totalProtein}g</p>
            </div>
            <div className="rounded-lg bg-card p-3">
              <p className="text-xs text-muted-foreground">{t('carbs', lang)}</p>
              <p className="text-2xl font-bold text-foreground">{totalCarbs}g</p>
            </div>
            <div className="rounded-lg bg-card p-3">
              <p className="text-xs text-muted-foreground">{t('fat', lang)}</p>
              <p className="text-2xl font-bold text-foreground">{totalFat}g</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meals Section */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Utensils className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">
            {t('meals', lang)} ({dailyLog.meals.length})
          </h2>
        </div>
        {dailyLog.meals.length > 0 ? (
          <div className="flex flex-col gap-2">
            {dailyLog.meals.map((meal) => (
              <Card key={meal.id} className="border-0 bg-card shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-foreground">
                          {meal.name}
                        </span>
                        {meal.isOffPlan && (
                          <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs text-destructive whitespace-nowrap">
                            {t('offPlan', lang)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs capitalize text-muted-foreground mb-2">
                        {meal.type === "breakfast" ? t('breakfast', lang) :
                         meal.type === "lunch" ? t('lunch', lang) :
                         meal.type === "dinner" ? t('dinner', lang) :
                         t('snack', lang)} • {meal.time}
                      </p>
                      {meal.photoUrl && (
                        <div className="mb-2 overflow-hidden rounded-lg">
                          <img
                            src={meal.photoUrl}
                            alt={meal.name}
                            className="h-32 w-full object-cover"
                          />
                        </div>
                      )}
                      <div className="grid grid-cols-4 gap-2">
                        <div className="rounded bg-muted p-2 text-center">
                          <p className="text-sm font-bold text-foreground">{meal.calories}</p>
                          <p className="text-[9px] text-muted-foreground">kcal</p>
                        </div>
                        <div className="rounded bg-muted p-2 text-center">
                          <p className="text-sm font-bold text-foreground">{meal.protein}g</p>
                          <p className="text-[9px] text-muted-foreground">{t('protein', lang)}</p>
                        </div>
                        <div className="rounded bg-muted p-2 text-center">
                          <p className="text-sm font-bold text-foreground">{meal.carbs}g</p>
                          <p className="text-[9px] text-muted-foreground">{t('carbs', lang)}</p>
                        </div>
                        <div className="rounded bg-muted p-2 text-center">
                          <p className="text-sm font-bold text-foreground">{meal.fat}g</p>
                          <p className="text-[9px] text-muted-foreground">{t('fat', lang)}</p>
                        </div>
                      </div>
                      {meal.allergenWarnings.length > 0 && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-destructive">
                          <span>⚠️</span>
                          <span>{meal.allergenWarnings.join(", ")}</span>
                        </div>
                      )}
                      {meal.notes && (
                        <p className="mt-2 text-xs text-muted-foreground">{meal.notes}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-2 border-dashed border-muted bg-muted/5">
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
              <Utensils className="mb-2 h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">{t('noMealsYet', lang)}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Water Section */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Droplets className="h-5 w-5 text-secondary" />
          <h2 className="text-lg font-semibold text-foreground">{t('water', lang)}</h2>
        </div>
        <Card className="border-0 bg-card shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {dailyLog.waterIntake}
                  <span className="text-sm font-normal text-muted-foreground"> ml</span>
                </p>
                <p className="text-xs text-muted-foreground">Water intake today</p>
              </div>
              <Droplets className="h-8 w-8 text-secondary/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Section */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Footprints className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">{t('activity', lang)}</h2>
        </div>
        <Card className="border-0 bg-card shadow-sm">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('steps', lang)}</p>
                <p className="text-2xl font-bold text-foreground">{dailyLog.steps || 0}</p>
              </div>
              <Footprints className="h-8 w-8 text-primary/30" />
            </div>
            {dailyLog.activityLevel && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t('activityLevel', lang)}</p>
                <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary capitalize whitespace-nowrap">
                  {dailyLog.activityLevel === "sedentary" ? t('sedentary', lang) :
                   dailyLog.activityLevel === "light" ? t('lightActivity', lang) :
                   dailyLog.activityLevel === "moderate" ? t('moderate', lang) :
                   t('activeLevel', lang)}
                </span>
              </div>
            )}
            {dailyLog.activityNotes && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t('notes', lang)}</p>
                <p className="text-sm text-foreground">{dailyLog.activityNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
