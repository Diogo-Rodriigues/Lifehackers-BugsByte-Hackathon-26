"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { saveProfile } from "@/lib/store"
import type { UserProfile } from "@/lib/types"
import {
  ChevronRight,
  ChevronLeft,
  User,
  Target,
  ShieldAlert,
  Utensils,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

const ALLERGY_OPTIONS = [
  "Gluten",
  "Dairy",
  "Eggs",
  "Peanuts",
  "Tree Nuts",
  "Soy",
  "Fish",
  "Shellfish",
  "Wheat",
  "Sesame",
]

const DIET_OPTIONS = [
  "Vegetarian",
  "Vegan",
  "Keto",
  "Paleo",
  "Mediterranean",
  "Low Carb",
  "Low Fat",
  "Halal",
  "Kosher",
  "No Preference",
]

interface OnboardingProps {
  onComplete: () => void
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0)
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    name: "",
    age: 25,
    sex: "male",
    height: 170,
    weight: 70,
    goal: "maintain",
    allergies: [],
    dietaryPreferences: [],
    dailyCalorieTarget: 2000,
    macros: { protein: 150, carbs: 250, fat: 67 },
    waterTarget: 2500,
  })

  const steps = [
    { title: "About You", icon: User },
    { title: "Goals", icon: Target },
    { title: "Allergies", icon: ShieldAlert },
    { title: "Preferences", icon: Utensils },
  ]

  function handleComplete() {
    const full: UserProfile = {
      name: profile.name || "Traveler",
      age: profile.age || 25,
      sex: profile.sex || "male",
      height: profile.height || 170,
      weight: profile.weight || 70,
      goal: profile.goal || "maintain",
      allergies: profile.allergies || [],
      dietaryPreferences: profile.dietaryPreferences || [],
      dailyCalorieTarget: profile.dailyCalorieTarget || 2000,
      macros: profile.macros || { protein: 150, carbs: 250, fat: 67 },
      waterTarget: profile.waterTarget || 2500,
      onboardingComplete: true,
    }
    saveProfile(full)
    onComplete()
  }

  function toggleItem(
    field: "allergies" | "dietaryPreferences",
    item: string
  ) {
    const list = (profile[field] as string[]) || []
    setProfile({
      ...profile,
      [field]: list.includes(item)
        ? list.filter((i) => i !== item)
        : [...list, item],
    })
  }

  function updateCaloriesFromGoal(goal: "lose" | "maintain" | "gain") {
    const base = 2000
    const cals =
      goal === "lose" ? base - 300 : goal === "gain" ? base + 300 : base
    const protein = Math.round(cals * 0.3 / 4)
    const fat = Math.round(cals * 0.25 / 9)
    const carbs = Math.round((cals - protein * 4 - fat * 9) / 4)
    setProfile({
      ...profile,
      goal,
      dailyCalorieTarget: cals,
      macros: { protein, carbs, fat },
    })
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="flex flex-col items-center gap-4 px-6 pt-12 pb-6">
        <Image src="/logo.png" alt="NutriFuel" width={180} height={180} priority />
        <p className="text-sm text-muted-foreground mt-2">
          Let{"'"}s set up your nutrition profile
        </p>

        {/* Step Indicator */}
        <div className="flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s.title} className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors",
                  i <= step
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {i + 1}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 w-6 rounded-full transition-colors",
                    i < step ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6">
        <Card className="border-0 shadow-none">
          <CardContent className="px-0 pt-0">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              {(() => {
                const StepIcon = steps[step].icon
                return <StepIcon className="h-5 w-5 text-primary" />
              })()}
              {steps[step].title}
            </h2>

            {/* Step 0: About You */}
            {step === 0 && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      min={10}
                      max={100}
                      value={profile.age ?? ""}
                      onChange={(e) => {
                        const val = e.target.value
                        setProfile({
                          ...profile,
                          age: val === "" ? undefined : parseInt(val),
                        })
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="sex">Sex</Label>
                    <Select
                      value={profile.sex}
                      onValueChange={(v) =>
                        setProfile({
                          ...profile,
                          sex: v as "male" | "female" | "other",
                        })
                      }
                    >
                      <SelectTrigger id="sex">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      min={100}
                      max={250}
                      value={profile.height ?? ""}
                      onChange={(e) => {
                        const val = e.target.value
                        setProfile({
                          ...profile,
                          height: val === "" ? undefined : parseInt(val),
                        })
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      min={30}
                      max={300}
                      value={profile.weight ?? ""}
                      onChange={(e) => {
                        const val = e.target.value
                        setProfile({
                          ...profile,
                          weight: val === "" ? undefined : parseInt(val),
                        })
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Goals */}
            {step === 1 && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label>Nutritional Goal</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { key: "lose", label: "Lose Weight" },
                        { key: "maintain", label: "Maintain" },
                        { key: "gain", label: "Gain Muscle" },
                      ] as const
                    ).map((g) => (
                      <button
                        key={g.key}
                        onClick={() => updateCaloriesFromGoal(g.key)}
                        className={cn(
                          "rounded-lg border px-3 py-3 text-sm font-medium transition-colors",
                          profile.goal === g.key
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card text-foreground hover:border-primary/50"
                        )}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="calories">
                    Daily Calorie Target: {profile.dailyCalorieTarget} kcal
                  </Label>
                  <Input
                    id="calories"
                    type="range"
                    min={1200}
                    max={4000}
                    step={50}
                    value={profile.dailyCalorieTarget}
                    onChange={(e) => {
                      const cals = parseInt(e.target.value)
                      const protein = Math.round((cals * 0.3) / 4)
                      const fat = Math.round((cals * 0.25) / 9)
                      const carbs = Math.round((cals - protein * 4 - fat * 9) / 4)
                      setProfile({
                        ...profile,
                        dailyCalorieTarget: cals,
                        macros: { protein, carbs, fat },
                      })
                    }}
                    className="h-2 accent-primary"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg bg-muted p-3 text-center">
                    <p className="text-xs text-muted-foreground">Protein</p>
                    <p className="text-lg font-semibold text-foreground">
                      {profile.macros?.protein}g
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted p-3 text-center">
                    <p className="text-xs text-muted-foreground">Carbs</p>
                    <p className="text-lg font-semibold text-foreground">
                      {profile.macros?.carbs}g
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted p-3 text-center">
                    <p className="text-xs text-muted-foreground">Fat</p>
                    <p className="text-lg font-semibold text-foreground">
                      {profile.macros?.fat}g
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="water">
                    Water Target: {profile.waterTarget}ml
                  </Label>
                  <Input
                    id="water"
                    type="range"
                    min={1000}
                    max={5000}
                    step={250}
                    value={profile.waterTarget}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        waterTarget: parseInt(e.target.value),
                      })
                    }
                    className="h-2 accent-secondary"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Allergies */}
            {step === 2 && (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">
                  Select any allergies or food intolerances. This helps us flag
                  unsafe dishes.
                </p>
                <div className="flex flex-wrap gap-2">
                  {ALLERGY_OPTIONS.map((allergy) => {
                    const selected = profile.allergies?.includes(allergy)
                    return (
                      <button
                        key={allergy}
                        onClick={() => toggleItem("allergies", allergy)}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                          selected
                            ? "border-destructive bg-destructive/10 text-destructive"
                            : "border-border bg-card text-foreground hover:border-destructive/50"
                        )}
                      >
                        {allergy}
                        {selected && <X className="h-3 w-3" />}
                      </button>
                    )
                  })}
                </div>
                {(profile.allergies?.length ?? 0) > 0 && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                    <p className="text-xs font-medium text-destructive">
                      Safety Guardrail Active
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      AI will never recommend dishes containing:{" "}
                      {profile.allergies?.join(", ")}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Dietary Preferences */}
            {step === 3 && (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">
                  Select your dietary preferences to personalize meal
                  recommendations.
                </p>
                <div className="flex flex-wrap gap-2">
                  {DIET_OPTIONS.map((diet) => {
                    const selected =
                      profile.dietaryPreferences?.includes(diet)
                    return (
                      <Badge
                        key={diet}
                        variant={selected ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer px-3 py-1.5 text-sm transition-colors",
                          selected
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "text-foreground hover:bg-muted"
                        )}
                        onClick={() =>
                          toggleItem("dietaryPreferences", diet)
                        }
                      >
                        {diet}
                      </Badge>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 px-6 py-6 safe-bottom">
        {step > 0 && (
          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
            className="flex-1"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        )}
        <Button
          onClick={() => {
            if (step < steps.length - 1) {
              setStep(step + 1)
            } else {
              handleComplete()
            }
          }}
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {step < steps.length - 1 ? (
            <>
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </>
          ) : (
            "Start Your Journey"
          )}
        </Button>
      </div>
    </div>
  )
}
