"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  getDailyLog,
  saveDailyLog,
  addMealToLog,
  todayString,
  generateId,
  getProfile,
} from "@/lib/store"
import type { DailyLog, MealLog } from "@/lib/types"
import {
  Plus,
  Droplets,
  Footprints,
  Activity,
  Trash2,
  Minus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function MealLogger() {
  const today = todayString()
  const profile = getProfile()
  const [dailyLog, setDailyLog] = useState<DailyLog>(getDailyLog(today))
  const [showMealForm, setShowMealForm] = useState(false)
  const [mealForm, setMealForm] = useState({
    name: "",
    type: "lunch" as "breakfast" | "lunch" | "dinner" | "snack",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    notes: "",
  })

  // Reload on changes
  useEffect(() => {
    setDailyLog(getDailyLog(today))
  }, [today])

  function handleAddMeal() {
    if (!mealForm.name) {
      toast.error("Please enter a meal name")
      return
    }
    const now = new Date()
    const meal: MealLog = {
      id: generateId(),
      date: today,
      time: `${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}`,
      type: mealForm.type,
      name: mealForm.name,
      calories: parseInt(mealForm.calories) || 0,
      protein: parseInt(mealForm.protein) || 0,
      carbs: parseInt(mealForm.carbs) || 0,
      fat: parseInt(mealForm.fat) || 0,
      ingredients: [],
      allergenWarnings: [],
      notes: mealForm.notes,
      isOffPlan: false,
    }
    const updated = addMealToLog(today, meal)
    setDailyLog(updated)
    setMealForm({
      name: "",
      type: "lunch",
      calories: "",
      protein: "",
      carbs: "",
      fat: "",
      notes: "",
    })
    setShowMealForm(false)
    toast.success("Meal logged!")
  }

  function removeMeal(mealId: string) {
    const updated = {
      ...dailyLog,
      meals: dailyLog.meals.filter((m) => m.id !== mealId),
    }
    saveDailyLog(updated)
    setDailyLog(updated)
    toast.success("Meal removed")
  }

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
    ? Math.min(100, (dailyLog.waterIntake / profile.waterTarget) * 100)
    : 0

  return (
    <div className="flex flex-col gap-6 px-4 pb-24 pt-4">
      <h1 className="font-display text-2xl text-primary">Daily Log</h1>

      <Tabs defaultValue="meals" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted">
          <TabsTrigger value="meals" className="data-[state=active]:bg-card data-[state=active]:text-foreground">Meals</TabsTrigger>
          <TabsTrigger value="water" className="data-[state=active]:bg-card data-[state=active]:text-foreground">Water</TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-card data-[state=active]:text-foreground">Activity</TabsTrigger>
        </TabsList>

        {/* Meals Tab */}
        <TabsContent value="meals" className="mt-4 flex flex-col gap-4">
          {/* Logged Meals */}
          {dailyLog.meals.length > 0 && (
            <div className="flex flex-col gap-2">
              {dailyLog.meals.map((meal) => (
                <Card key={meal.id} className="border-0 bg-card shadow-sm">
                  <CardContent className="flex items-center justify-between p-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-foreground">
                        {meal.name}
                      </span>
                      <span className="text-xs capitalize text-muted-foreground">
                        {meal.type} - {meal.time}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {meal.calories} kcal | P: {meal.protein}g | C:{" "}
                        {meal.carbs}g | F: {meal.fat}g
                      </span>
                    </div>
                    <button
                      onClick={() => removeMeal(meal.id)}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      aria-label={`Remove ${meal.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Add Meal Form */}
          {showMealForm ? (
            <Card className="border border-primary/20 bg-card shadow-sm">
              <CardContent className="flex flex-col gap-3 p-4">
                <h3 className="text-sm font-semibold text-foreground">
                  Add Manual Meal
                </h3>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="meal-name">Meal Name</Label>
                  <Input
                    id="meal-name"
                    placeholder="e.g. Grilled Chicken Salad"
                    value={mealForm.name}
                    onChange={(e) =>
                      setMealForm({ ...mealForm, name: e.target.value })
                    }
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Meal Type</Label>
                  <Select
                    value={mealForm.type}
                    onValueChange={(v) =>
                      setMealForm({
                        ...mealForm,
                        type: v as typeof mealForm.type,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakfast">Breakfast</SelectItem>
                      <SelectItem value="lunch">Lunch</SelectItem>
                      <SelectItem value="dinner">Dinner</SelectItem>
                      <SelectItem value="snack">Snack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="meal-cal">Calories</Label>
                    <Input
                      id="meal-cal"
                      type="number"
                      placeholder="kcal"
                      value={mealForm.calories}
                      onChange={(e) =>
                        setMealForm({ ...mealForm, calories: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="meal-prot">Protein (g)</Label>
                    <Input
                      id="meal-prot"
                      type="number"
                      placeholder="g"
                      value={mealForm.protein}
                      onChange={(e) =>
                        setMealForm({ ...mealForm, protein: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="meal-carbs">Carbs (g)</Label>
                    <Input
                      id="meal-carbs"
                      type="number"
                      placeholder="g"
                      value={mealForm.carbs}
                      onChange={(e) =>
                        setMealForm({ ...mealForm, carbs: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="meal-fat">Fat (g)</Label>
                    <Input
                      id="meal-fat"
                      type="number"
                      placeholder="g"
                      value={mealForm.fat}
                      onChange={(e) =>
                        setMealForm({ ...mealForm, fat: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="meal-notes">Notes</Label>
                  <Textarea
                    id="meal-notes"
                    placeholder="Any notes about this meal"
                    value={mealForm.notes}
                    onChange={(e) =>
                      setMealForm({ ...mealForm, notes: e.target.value })
                    }
                    className="min-h-[60px]"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowMealForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddMeal}
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Add Meal
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Button
              onClick={() => setShowMealForm(true)}
              variant="outline"
              className="border-dashed border-primary/30 text-primary hover:bg-primary/5"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Meal Manually
            </Button>
          )}
        </TabsContent>

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
                  of {profile?.waterTarget || 2500}ml target
                </p>
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
                  <Label htmlFor="steps">Step Count</Label>
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
                <Label className="mb-2 block">Activity Level</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      {
                        key: "sedentary",
                        label: "Sedentary",
                        desc: "Desk work",
                      },
                      {
                        key: "light",
                        label: "Light",
                        desc: "Walking tours",
                      },
                      {
                        key: "moderate",
                        label: "Moderate",
                        desc: "Hiking, cycling",
                      },
                      {
                        key: "active",
                        label: "Active",
                        desc: "Sports, intense",
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
                <Label htmlFor="activity-notes">Activity Notes</Label>
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
