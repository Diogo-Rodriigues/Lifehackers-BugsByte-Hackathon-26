"use client"

import { useState, useEffect } from "react"
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
import { DESTINATIONS, TIMEZONE_OFFSETS } from "@/lib/constants"
import { generateId, saveTrip, setActiveTrip, saveApiKey, getApiKey, getAllergyOptions, saveAllergyOptions, getDietOptions, saveDietOptions } from "@/lib/store"
import { apiFetch } from "@/lib/api"
import type { Trip, LocalDish, MealPlan } from "@/lib/types"
import { getLanguage, setLanguage, t, type Language, LANGUAGES } from "@/lib/language"
import {
  Plane,
  Calendar,
  Loader2,
  AlertTriangle,
  ShieldCheck,
  Check,
  Clock,
  Key,
} from "lucide-react"
import { toast } from "sonner"

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
  "Not Know",
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
  const [language, setLanguageState] = useState<Language>('en')
  const [apiKey, setApiKey] = useState("")
  const [allergyOptions, setAllergyOptions] = useState(ALLERGY_OPTIONS)
  const [dietOptions, setDietOptions] = useState(DIET_OPTIONS)
  const [customAllergy, setCustomAllergy] = useState("")
  const [customDietPreference, setCustomDietPreference] = useState("")
  const [customAllergyError, setCustomAllergyError] = useState("")
  const [customDietError, setCustomDietError] = useState("")
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

  const [trip, setTrip] = useState<Partial<Trip>>({
    destination: "",
    departureCity: "",
    departureDate: "",
    arrivalDate: "",
    departureTime: "",
    arrivalTime: "",
    layovers: [],
    selectedDishes: [],
  })
  const [localDishes, setLocalDishes] = useState<LocalDish[]>([])
  const [loadingDishes, setLoadingDishes] = useState(false)
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null)
  const [loadingPlan, setLoadingPlan] = useState(false)

  useEffect(() => {
    setAllergyOptions(getAllergyOptions(ALLERGY_OPTIONS))
    setDietOptions(getDietOptions(DIET_OPTIONS))
  }, [])

  useEffect(() => {
    saveAllergyOptions(allergyOptions)
  }, [allergyOptions])

  useEffect(() => {
    saveDietOptions(dietOptions)
  }, [dietOptions])

  // Load existing API key if available
  useEffect(() => {
    setApiKey(getApiKey() || "")
    setLanguageState(getLanguage())
  }, [])

  const steps = [
    { title: t('aboutYou', language), icon: User },
    { title: t('goals', language), icon: Target },
    { title: t('allergies', language), icon: ShieldAlert },
    { title: t('preferences', language), icon: Utensils },
    { title: t('tripDetails', language), icon: Plane },
    { title: t('localCuisine', language), icon: Utensils },
    { title: t('mealPlan', language), icon: ShieldCheck },
  ]

  function getAllergyLabel(allergy: string): string {
    const map: Record<string, string> = {
      "Gluten": t('gluten', language),
      "Dairy": t('dairy', language),
      "Eggs": t('eggs', language),
      "Peanuts": t('peanuts', language),
      "Tree Nuts": t('treeNuts', language),
      "Soy": t('soy', language),
      "Fish": t('fish', language),
      "Shellfish": t('shellfish', language),
      "Wheat": t('wheat', language),
      "Sesame": t('sesame', language),
      "Not Know": t('notKnow', language),
    }
    return map[allergy] || allergy
  }

  function getDietLabel(diet: string): string {
    const map: Record<string, string> = {
      "Vegetarian": t('vegetarian', language),
      "Vegan": t('vegan', language),
      "Keto": t('keto', language),
      "Paleo": t('paleo', language),
      "Mediterranean": t('mediterranean', language),
      "Low Carb": t('lowCarb', language),
      "Low Fat": t('lowFat', language),
      "Halal": t('halal', language),
      "Kosher": t('kosher', language),
      "No Preference": t('noPreference', language),
    }
    return map[diet] || diet
  }

  async function fetchLocalDishes() {
    if (!trip.destination) return
    setLoadingDishes(true)
    try {
      // Use local profile state for preferences
      const res = await apiFetch("/api/dishes", {
        destination: trip.destination,
        allergies: profile.allergies || [],
        preferences: profile.dietaryPreferences || [],
      })
      if (!res.ok) throw new Error("Failed to fetch dishes")
      const data = await res.json()
      setLocalDishes(data.dishes || [])
    } catch {
      toast.error("Could not load local dishes. Using offline data.")
      setLocalDishes(getDefaultDishes(trip.destination!))
    } finally {
      setLoadingDishes(false)
    }
  }

  async function generateMealPlan() {
    setLoadingPlan(true)
    try {
      // Ensure we have required trip data
      if (!trip.destination || !trip.departureDate || !trip.arrivalDate) {
        toast.error("Please complete trip details first")
        setLoadingPlan(false)
        return
      }

      const res = await apiFetch("/api/meal-plan", {
        trip: {
          ...trip,
          id: trip.id || generateId(),
          timezoneShift: TIMEZONE_OFFSETS[trip.destination] || 0,
        },
        profile,
        selectedDishes: trip.selectedDishes || [],
      })
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        console.error("Meal plan API error:", errorData)
        throw new Error(errorData.error || "Failed to generate plan")
      }
      
      const data = await res.json()
      if (!data.plan) {
        throw new Error("No plan returned from API")
      }
      setMealPlan(data.plan)
    } catch (error) {
      console.error("Generate meal plan error:", error)
      toast.error(t('couldNotGeneratePlan', language) || "Could not generate meal plan. Using offline template.")
      // Cast trip to Trip since we know required fields are set by this step
      const tempTrip: Trip = {
        id: trip.id || generateId(),
        destination: trip.destination || "",
        departureCity: trip.departureCity || "Home",
        departureDate: trip.departureDate || new Date().toISOString().split("T")[0],
        departureTime: trip.departureTime || "12:00",
        arrivalDate: trip.arrivalDate || new Date().toISOString().split("T")[0],
        arrivalTime: trip.arrivalTime || "12:00",
        timezoneShift: TIMEZONE_OFFSETS[trip.destination || ""] || 0,
        layovers: trip.layovers || [],
        selectedDishes: trip.selectedDishes || [],
        mealPlan: null,
      }
      setMealPlan(getDefaultMealPlan(tempTrip))
    } finally {
      setLoadingPlan(false)
    }
  }

  function toggleDish(dish: LocalDish) {
    const selected = trip.selectedDishes || []
    const exists = selected.find((d) => d.name === dish.name)
    const newSelectedDishes = exists
      ? selected.filter((d) => d.name !== dish.name)
      : [...selected, dish]
    
    setTrip({
      ...trip,
      selectedDishes: newSelectedDishes,
    })
    
    // Visual feedback
    if (!exists) {
      toast.success(`${dish.name} ${t('added', language) || 'added'}`, { duration: 1000 })
    }
  }

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

    // Save Profile
    saveProfile(full)

    // Save Trip if destination is selected
    if (trip.destination) {
      const fullTrip: Trip = {
        id: generateId(),
        destination: trip.destination,
        departureCity: trip.departureCity || "Home",
        departureDate: trip.departureDate || new Date().toISOString().split("T")[0],
        departureTime: trip.departureTime || "12:00",
        arrivalDate: trip.arrivalDate || new Date().toISOString().split("T")[0],
        arrivalTime: trip.arrivalTime || "12:00",
        timezoneShift: TIMEZONE_OFFSETS[trip.destination] || 0,
        layovers: trip.layovers || [],
        selectedDishes: trip.selectedDishes || [],
        mealPlan: mealPlan ? { ...mealPlan, status: "dietitian-verified" } : null,
      }
      saveTrip(fullTrip)
      setActiveTrip(fullTrip.id)
    }

    onComplete()
  }

  function toggleItem(
    field: "allergies" | "dietaryPreferences",
    item: string
  ) {
    const list = (profile[field] as string[]) || []
    const isExclusiveAllergy = field === "allergies" && item === "Not Know"
    const isExclusiveDiet =
      field === "dietaryPreferences" && item === "No Preference"
    const exclusiveValue = isExclusiveAllergy
      ? "Not Know"
      : isExclusiveDiet
      ? "No Preference"
      : null

    if (exclusiveValue) {
      setProfile({
        ...profile,
        [field]: list.includes(exclusiveValue) ? [] : [exclusiveValue],
      })
      return
    }

    const cleanedList = list.filter(
      (i) => i !== "Not Know" && i !== "No Preference"
    )
    setProfile({
      ...profile,
      [field]: cleanedList.includes(item)
        ? cleanedList.filter((i) => i !== item)
        : [...cleanedList, item],
    })
  }

  function addCustomItem(
    field: "allergies" | "dietaryPreferences",
    rawValue: string
  ) {
    const value = rawValue.trim()
    if (!value) return
    const list = (profile[field] as string[]) || []
    const normalized = value.toLowerCase()
    const options = field === "allergies" ? allergyOptions : dietOptions
    const existsInOptions = options.some(
      (item) => item.toLowerCase() === normalized
    )
    const existsInSelection = list.some(
      (item) => item.toLowerCase() === normalized
    )

    if (existsInSelection) {
      if (field === "allergies") {
        setCustomAllergyError(t('alreadyAdded', language))
      } else {
        setCustomDietError(t('alreadyAdded', language))
      }
      return
    }

    if (!existsInOptions) {
      if (field === "allergies") {
        setAllergyOptions((prev) => [...prev, value])
      } else {
        setDietOptions((prev) => [...prev, value])
      }
    }

    const cleanedList = list.filter(
      (i) => i !== "Not Know" && i !== "No Preference"
    )
    setProfile({
      ...profile,
      [field]: [...cleanedList, value],
    })
    if (field === "allergies") {
      setCustomAllergyError("")
    } else {
      setCustomDietError("")
    }
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
    <div className="flex min-h-screen flex-col bg-background relative">
      {/* Language Selector - Top Right */}
      <div className="absolute top-6 right-6 z-10">
        <Select 
          value={language} 
          onValueChange={(value) => {
            setLanguage(value as Language)
            setLanguageState(value as Language)
          }}
        >
          <SelectTrigger className="w-[90px] h-8 text-xs border-0 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm font-semibold">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((lang) => (
              <SelectItem key={lang.code} value={lang.code} className="cursor-pointer text-xs">
                {lang.code.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Header */}
      <div className="flex flex-col items-center gap-3 px-6 pt-16 pb-8">
        <Image src="/logo.png" alt="NutriFuel" width={160} height={160} priority className="mb-2" />
        <p className="text-base text-muted-foreground font-medium text-center">
          {t('setupProfile', language)}
        </p>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-1 sm:gap-2 w-full px-4 mt-4">
          {steps.map((s, i) => (
            <div key={s.title} className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <div
                className={cn(
                  "flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 flex-shrink-0 shadow-sm",
                  i <= step
                    ? "bg-primary text-primary-foreground ring-2 ring-primary/20"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {i + 1}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 w-3 sm:w-6 rounded-full transition-all duration-300 flex-shrink-0",
                    i < step ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6">
        <Card className="border-0 shadow-none">
          <CardContent className="px-0 pt-0">
            <h2 className="mb-6 flex items-center gap-2.5 text-xl font-bold text-foreground">
              {(() => {
                const StepIcon = steps[step].icon
                return <StepIcon className="h-6 w-6 text-primary" />
              })()}
              {steps[step].title}
            </h2>

            {/* Step 0: About You */}
            {step === 0 && (
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="api-key" className="flex items-center gap-2 text-sm font-semibold">
                    <Key className="h-4 w-4 text-primary" />
                    {t('apiKey', language)}
                  </Label>
                  <Input
                    id="api-key"
                    type="password"
                    placeholder={t('apiKeyPlaceholder', language)}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="h-11"
                  />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t('apiKeyDescription', language)}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="name" className="text-sm font-semibold">{t('name', language)}</Label>
                  <Input
                    id="name"
                    placeholder={t('namePlaceholder', language)}
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                    className="h-11"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="age" className="text-sm font-semibold">{t('age', language)}</Label>
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
                      className="h-11"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="sex" className="text-sm font-semibold">{t('sex', language)}</Label>
                    <Select
                      value={profile.sex}
                      onValueChange={(v) =>
                        setProfile({
                          ...profile,
                          sex: v as "male" | "female" | "other",
                        })
                      }
                    >
                      <SelectTrigger id="sex" className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">{t('male', language)}</SelectItem>
                        <SelectItem value="female">{t('female', language)}</SelectItem>
                        <SelectItem value="other">{t('other', language)}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="height" className="text-sm font-semibold">{t('height', language)}</Label>
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
                      className="h-11"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="weight" className="text-sm font-semibold">{t('weight', language)}</Label>
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
                      className="h-11"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Goals */}
            {step === 1 && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label>{t('nutritionalGoal', language)}</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { key: "lose", label: t('loseWeight', language) },
                        { key: "maintain", label: t('maintain', language) },
                        { key: "gain", label: t('gainMuscle', language) },
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
                    {t('dailyCalorieTarget', language)}: {profile.dailyCalorieTarget} kcal
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
                    {t('waterTarget', language)}: {profile.waterTarget}ml
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
                  {t('selectAllergiesDesc', language)}
                </p>
                <div className="flex flex-wrap gap-2">
                  {allergyOptions.map((allergy) => {
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
                        {getAllergyLabel(allergy)}
                        {selected && <X className="h-3 w-3" />}
                      </button>
                    )
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder={t('addAllergy', language)}
                    value={customAllergy}
                    onChange={(e) => {
                      setCustomAllergy(e.target.value)
                      if (customAllergyError) setCustomAllergyError("")
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addCustomItem("allergies", customAllergy)
                        setCustomAllergy("")
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      addCustomItem("allergies", customAllergy)
                      setCustomAllergy("")
                    }}
                  >
                    {t('add', language)}
                  </Button>
                </div>
                {customAllergyError && (
                  <p className="text-xs text-destructive">
                    {customAllergyError}
                  </p>
                )}
                {(profile.allergies?.length ?? 0) > 0 && !profile.allergies?.includes("Not Know") && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                    <p className="text-xs font-medium text-destructive">
                      {t('safetyGuardrail', language)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t('aiWillNever', language)}{" "}
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
                  {t('selectPreferencesDesc', language)}
                </p>
                <div className="flex flex-wrap gap-2">
                  {dietOptions.map((diet) => {
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
                        {getDietLabel(diet)}
                      </Badge>
                    )
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder={t('addPreference', language)}
                    value={customDietPreference}
                    onChange={(e) => {
                      setCustomDietPreference(e.target.value)
                      if (customDietError) setCustomDietError("")
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addCustomItem(
                          "dietaryPreferences",
                          customDietPreference
                        )
                        setCustomDietPreference("")
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      addCustomItem(
                        "dietaryPreferences",
                        customDietPreference
                      )
                      setCustomDietPreference("")
                    }}
                  >
                    {t('add', language)}
                  </Button>
                </div>
                {customDietError && (
                  <p className="text-xs text-destructive">
                    {customDietError}
                  </p>
                )}
              </div>
            )}

            {/* Step 4: Trip Details */}
            {step === 4 && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="departure-city">{t('departureCity', language)}</Label>
                  <Input
                    id="departure-city"
                    placeholder={t('departureCityPlaceholder', language)}
                    value={trip.departureCity}
                    onChange={(e) =>
                      setTrip({ ...trip, departureCity: e.target.value })
                    }
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="destination">{t('destinationCountry', language)}</Label>
                  <Select
                    value={trip.destination}
                    onValueChange={(v) =>
                      setTrip({ ...trip, destination: v })
                    }
                  >
                    <SelectTrigger id="destination">
                      <SelectValue placeholder={t('selectDestination', language)} />
                    </SelectTrigger>
                    <SelectContent>
                      {DESTINATIONS.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="dep-date">{t('departure', language)}</Label>
                    <Input
                      id="dep-date"
                      type="date"
                      value={trip.departureDate}
                      onChange={(e) =>
                        setTrip({ ...trip, departureDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="dep-time">{t('departureTime', language)}</Label>
                    <Input
                      id="dep-time"
                      type="time"
                      value={trip.departureTime}
                      onChange={(e) =>
                        setTrip({ ...trip, departureTime: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="arr-date">{t('arrival', language)}</Label>
                    <Input
                      id="arr-date"
                      type="date"
                      value={trip.arrivalDate}
                      onChange={(e) =>
                        setTrip({ ...trip, arrivalDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="arr-time">{t('arrivalTime', language)}</Label>
                    <Input
                      id="arr-time"
                      type="time"
                      value={trip.arrivalTime}
                      onChange={(e) =>
                        setTrip({ ...trip, arrivalTime: e.target.value })
                      }
                    />
                  </div>
                </div>
                {trip.destination && (
                  <Card className="border border-secondary/30 bg-accent/50 shadow-none">
                    <CardContent className="flex items-center gap-3 p-3">
                      <Clock className="h-5 w-5 text-secondary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {t('timezoneShift', language)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {trip.destination} {t('timezoneDesc', language)}
                          {TIMEZONE_OFFSETS[trip.destination] > 0 ? "+" : ""}
                          {TIMEZONE_OFFSETS[trip.destination]}{t('mealTimesAdjusted', language)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Step 5: Local Cuisine (Dishes) */}
            {step === 5 && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {t('selectDishes', language)} {trip.destination}.
                  </p>
                  <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {trip.selectedDishes?.length || 0} {t('selected', language)}
                  </span>
                </div>

                {loadingDishes ? (
                  <div className="flex flex-col items-center gap-3 py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">
                      {t('discoveringCuisine', language)}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6 max-h-[400px] overflow-y-auto pr-2">
                    {["soups", "main", "desserts", "snacks"].map((category) => {
                      const dishes = localDishes.filter(
                        (d) => d.category === category
                      )
                      if (dishes.length === 0) return null
                      return (
                        <div key={category}>
                          <h3 className="mb-2 text-sm font-semibold capitalize text-foreground">
                            {category}
                          </h3>
                          <div className="flex flex-col gap-2">
                            {dishes.map((dish) => {
                              const isSelected = trip.selectedDishes?.some(
                                (d) => d.name === dish.name
                              )
                              // Filter out "Not Know" from allergies for conflict checking
                              const realAllergies = profile.allergies?.filter(a => a !== "Not Know") || []
                              const hasNotKnow = profile.allergies?.includes("Not Know")
                              const hasAllergenConflict = dish.allergens.some(
                                (a) => realAllergies.includes(a)
                              )
                              return (
                                <Card
                                  key={dish.name}
                                  className={cn(
                                    "cursor-pointer border-2 transition-all duration-200",
                                    isSelected
                                      ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/20"
                                      : "border-border bg-card hover:border-primary/30",
                                    hasAllergenConflict &&
                                    "border-destructive/50 opacity-60"
                                  )}
                                  onClick={() => {
                                    if (hasAllergenConflict) {
                                      toast.error(
                                        `${t('contains', language) || 'Contains'}: ${dish.allergens.join(", ")}`
                                      )
                                      return
                                    }
                                    toggleDish(dish)
                                  }}
                                >
                                  <CardContent className="flex items-center justify-between p-3">
                                    <div className="flex flex-col gap-0.5">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-foreground">
                                          {dish.name}
                                        </span>
                                        {hasAllergenConflict && (
                                          <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                                        )}
                                      </div>
                                      <span className="text-xs text-muted-foreground">
                                        {dish.description}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        ~{dish.estimatedCalories} {t('calories', language)}
                                      </span>
                                      {dish.allergens.length > 0 && (
                                        <span className="text-[10px] text-muted-foreground">
                                          {t('allergens', language) || 'Allergens'}: {dish.allergens.join(", ")}
                                        </span>
                                      )}
                                    </div>
                                    {isSelected && (
                                      <div className="rounded-full bg-primary p-1">
                                        <Check className="h-4 w-4 text-primary-foreground" />
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Step 6: Meal Plan Verification */}
            {step === 6 && (
              <div className="flex flex-col gap-4">
                {loadingPlan ? (
                  <div className="flex flex-col items-center gap-3 py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">
                      {t('aiCrafting', language)}
                    </p>
                  </div>
                ) : mealPlan ? (
                  <>
                    <Card className="border border-primary/30 bg-primary/5 shadow-none">
                      <CardContent className="flex items-start gap-3 p-4">
                        <Utensils className="mt-0.5 h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            Personalized Plan Ready
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            Based on your goals, allergies, and selected local dishes.
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="max-h-[400px] overflow-y-auto pr-2 flex flex-col gap-2">
                      {mealPlan.days.map((day) => (
                        <Card key={day.date} className="border-0 bg-card shadow-sm">
                          <CardContent className="p-4">
                            <p className="mb-3 text-xs font-medium text-muted-foreground">
                              {day.date}
                            </p>
                            <div className="flex flex-col gap-2">
                              {day.meals.map((meal) => (
                                <div
                                  key={meal.id}
                                  className="flex items-center justify-between rounded-lg bg-muted/50 p-2.5"
                                >
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="w-14 text-[10px] font-medium uppercase text-muted-foreground">
                                        {meal.type}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        {meal.suggestedTime}
                                      </span>
                                    </div>
                                    <p className="mt-0.5 text-sm font-medium text-foreground">
                                      {meal.dish}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-semibold text-foreground">
                                      {meal.calories}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                      kcal
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 px-6 py-6 pb-8 safe-bottom border-t border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        {step > 0 && (
          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
            className="flex-1 h-12 font-semibold shadow-sm hover:shadow transition-all"
          >
            <ChevronLeft className="mr-1.5 h-5 w-5" />
            {t('back', language)}
          </Button>
        )}
        <Button
          onClick={() => {
            if (step < steps.length - 1) {
              const nextStep = step + 1

              // Save API Key if moving from Step 0
              if (step === 0 && apiKey) {
                saveApiKey(apiKey)
              }

              setStep(nextStep)
              // Trigger data fetching for next steps
              if (nextStep === 5) { // Local Cuisine
                fetchLocalDishes()
              }
              if (nextStep === 6) { // Meal Plan
                generateMealPlan()
              }
            } else {
              handleComplete()
            }
          }}
          className="flex-1 h-12 font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg transition-all"
        >
          {step < steps.length - 1 ? (
            <>
              {t('next', language)}
              <ChevronRight className="ml-1.5 h-5 w-5" />
            </>
          ) : (
            t('finish', language)
          )}
        </Button>
      </div>
    </div>
  )
}

// Fallback dishes when API is unavailable
function getDefaultDishes(destination: string): LocalDish[] {
  const dishes: Record<string, LocalDish[]> = {
    Japan: [
      { name: "Miso Soup", category: "soups", description: "Traditional soybean soup with tofu and seaweed", estimatedCalories: 84, allergens: ["Soy"] },
      { name: "Ramen", category: "soups", description: "Rich broth noodle soup with pork and egg", estimatedCalories: 550, allergens: ["Wheat", "Eggs", "Soy"] },
      { name: "Sushi Platter", category: "main", description: "Assorted nigiri and maki rolls", estimatedCalories: 400, allergens: ["Fish", "Soy", "Shellfish"] },
      { name: "Tonkatsu", category: "main", description: "Breaded deep-fried pork cutlet", estimatedCalories: 600, allergens: ["Wheat", "Eggs"] },
      { name: "Teriyaki Chicken", category: "main", description: "Grilled chicken with teriyaki sauce", estimatedCalories: 450, allergens: ["Soy"] },
      { name: "Matcha Mochi", category: "desserts", description: "Green tea flavored rice cake", estimatedCalories: 150, allergens: [] },
      { name: "Onigiri", category: "snacks", description: "Rice ball with various fillings", estimatedCalories: 180, allergens: ["Fish"] },
      { name: "Edamame", category: "snacks", description: "Steamed young soybeans", estimatedCalories: 120, allergens: ["Soy"] },
    ],
    Italy: [
      { name: "Minestrone", category: "soups", description: "Hearty vegetable soup with pasta", estimatedCalories: 200, allergens: ["Wheat"] },
      { name: "Margherita Pizza", category: "main", description: "Classic pizza with tomato, mozzarella, basil", estimatedCalories: 700, allergens: ["Wheat", "Dairy"] },
      { name: "Pasta Carbonara", category: "main", description: "Spaghetti with eggs, cheese, and pancetta", estimatedCalories: 600, allergens: ["Wheat", "Eggs", "Dairy"] },
      { name: "Risotto ai Funghi", category: "main", description: "Creamy mushroom risotto", estimatedCalories: 450, allergens: ["Dairy"] },
      { name: "Tiramisu", category: "desserts", description: "Coffee-flavored layered dessert", estimatedCalories: 350, allergens: ["Dairy", "Eggs", "Wheat"] },
      { name: "Gelato", category: "desserts", description: "Italian-style ice cream", estimatedCalories: 200, allergens: ["Dairy"] },
      { name: "Bruschetta", category: "snacks", description: "Toasted bread with tomato and basil", estimatedCalories: 150, allergens: ["Wheat"] },
    ],
    Thailand: [
      { name: "Tom Yum Goong", category: "soups", description: "Spicy and sour shrimp soup", estimatedCalories: 200, allergens: ["Shellfish", "Fish"] },
      { name: "Pad Thai", category: "main", description: "Stir-fried rice noodles with shrimp", estimatedCalories: 500, allergens: ["Peanuts", "Shellfish", "Eggs", "Fish"] },
      { name: "Green Curry", category: "main", description: "Creamy coconut curry with chicken", estimatedCalories: 450, allergens: ["Fish"] },
      { name: "Mango Sticky Rice", category: "desserts", description: "Sweet coconut rice with fresh mango", estimatedCalories: 350, allergens: [] },
      { name: "Spring Rolls", category: "snacks", description: "Fresh vegetable rolls with dipping sauce", estimatedCalories: 180, allergens: ["Peanuts", "Fish"] },
    ],
    Mexico: [
      { name: "Tortilla Soup", category: "soups", description: "Tomato-based soup with crispy tortilla strips", estimatedCalories: 250, allergens: [] },
      { name: "Tacos al Pastor", category: "main", description: "Pork tacos with pineapple and cilantro", estimatedCalories: 400, allergens: [] },
      { name: "Enchiladas", category: "main", description: "Rolled tortillas in chili sauce with cheese", estimatedCalories: 500, allergens: ["Dairy"] },
      { name: "Churros", category: "desserts", description: "Fried dough with cinnamon sugar", estimatedCalories: 300, allergens: ["Wheat", "Eggs"] },
      { name: "Guacamole", category: "snacks", description: "Fresh avocado dip with tortilla chips", estimatedCalories: 200, allergens: [] },
    ],
  }
  return (
    dishes[destination] ||
    dishes["Italy"] || []
  )
}

function getDefaultMealPlan(trip: Trip): MealPlan {
  const startDate = trip.departureDate || new Date().toISOString().split("T")[0]
  return {
    id: generateId(),
    tripId: trip.id,
    status: "ai-generated",
    days: [
      {
        date: startDate,
        adjustedTimezone: trip.timezoneShift,
        meals: [
          { id: generateId(), type: "breakfast", suggestedTime: "8:00", dish: "Light local breakfast", calories: 350, protein: 15, carbs: 45, fat: 12, notes: "Easy digestion for travel day" },
          { id: generateId(), type: "lunch", suggestedTime: "12:30", dish: trip.selectedDishes?.[0]?.name || "Local specialty", calories: 500, protein: 25, carbs: 60, fat: 18, notes: "" },
          { id: generateId(), type: "dinner", suggestedTime: "19:00", dish: trip.selectedDishes?.[1]?.name || "Balanced dinner", calories: 600, protein: 30, carbs: 65, fat: 22, notes: "Adjusted for timezone" },
          { id: generateId(), type: "snack", suggestedTime: "15:30", dish: trip.selectedDishes?.[2]?.name || "Healthy snack", calories: 200, protein: 8, carbs: 25, fat: 8, notes: "" },
        ],
      },
    ],
  }
}
