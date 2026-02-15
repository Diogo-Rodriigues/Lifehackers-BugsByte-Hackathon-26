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
  Wifi,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

import { generateId, saveTrip, setActiveTrip, saveApiKey, getApiKey, getAllergyOptions, saveAllergyOptions, getDietOptions, saveDietOptions } from "@/lib/store"
import { apiFetch } from "@/lib/api"
import type { Trip, LocalDish, LocalBeverage, MealPlan, CaffeineRecommendation } from "@/lib/types"
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

interface NutritionistProfile {
  name: string
  photoUrl: string
}

const DEFAULT_NUTRITIONIST: NutritionistProfile = {
  name: "Local Nutrition Specialist",
  photoUrl: "/nutritionists/default.jpg",
}

const NUTRITIONIST_BY_DESTINATION: Record<string, NutritionistProfile> = {
  Japan: { name: "Dr. Aiko Tanaka", photoUrl: "/nutritionists/japan.jpg" },
  Thailand: { name: "Dr. Naree Suksawat", photoUrl: "/nutritionists/thailand.jpg" },
  Mexico: { name: "Dr. Valeria Soto", photoUrl: "/nutritionists/mexico.jpg" },
  Italy: { name: "Dr.ssa Giulia Romano", photoUrl: "/nutritionists/italy.jpg" },
  India: { name: "Dr. Priya Menon", photoUrl: "/nutritionists/india.jpg" },
  France: { name: "Dr. Camille Laurent", photoUrl: "/nutritionists/france.jpg" },
  Morocco: { name: "Dr. Leila Idrissi", photoUrl: "/nutritionists/morocco.jpg" },
  Peru: { name: "Dr. Luciana Quispe", photoUrl: "/nutritionists/peru.jpg" },
  "South Korea": { name: "Dr. Minji Park", photoUrl: "/nutritionists/south-korea.jpg" },
  Spain: { name: "Dr. Elena Navarro", photoUrl: "/nutritionists/spain.jpg" },
  Turkey: { name: "Dr. Selin Kaya", photoUrl: "/nutritionists/turkey.jpg" },
  Vietnam: { name: "Dr. Linh Tran", photoUrl: "/nutritionists/vietnam.jpg" },
  Greece: { name: "Dr. Eleni Papadopoulou", photoUrl: "/nutritionists/greece.jpg" },
  Brazil: { name: "Dr. Marina Costa", photoUrl: "/nutritionists/brazil.jpg" },
  Colombia: { name: "Dr. Sofia Ramirez", photoUrl: "/nutritionists/colombia.jpg" },
}

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
    arrivalDate: "",
    arrivalTime: "",
    returnDate: "",
    returnTime: "",
    layovers: [],
    selectedDishes: [],
    selectedBeverages: [],
  })
  const [localDishes, setLocalDishes] = useState<LocalDish[]>([])
  const [localBeverages, setLocalBeverages] = useState<LocalBeverage[]>([])
  const [loadingDishes, setLoadingDishes] = useState(false)
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null)
  const [loadingPlan, setLoadingPlan] = useState(false)
  const [reviewChoice, setReviewChoice] = useState<"ai" | "dietitian" | null>(null)
  const [isSimulatingDietitianReview, setIsSimulatingDietitianReview] = useState(false)
  const [dietitianReviewCompleted, setDietitianReviewCompleted] = useState(false)
  const [reviewedNutritionist, setReviewedNutritionist] = useState<NutritionistProfile | null>(null)
  const [isConnectingNutrium, setIsConnectingNutrium] = useState(false)
  const [nutritionMethod, setNutritionMethod] = useState<'nutrium' | 'estimate' | null>(null)
  const [nutriumConnected, setNutriumConnected] = useState(false)

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
    { title: t('nutritionGoals', language) || 'Nutrition Goals', icon: Target },
    { title: t('allergies', language), icon: ShieldAlert },
    { title: t('preferences', language), icon: Utensils },
    { title: t('tripDetails', language), icon: Plane },
    { title: t('localCuisine', language), icon: Utensils },
    { title: t('mealPlan', language), icon: ShieldCheck },
    { title: t('planConfirmation', language), icon: ShieldCheck },
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
      setLocalBeverages(data.beverages || [])
    } catch {
      toast.error("Could not load local dishes. Using offline data.")
      setLocalDishes(getDefaultDishes(trip.destination!))
      setLocalBeverages(getDefaultBeverages(trip.destination!))
    } finally {
      setLoadingDishes(false)
    }
  }

  async function generateMealPlan() {
    setLoadingPlan(true)
    try {
      // Ensure we have required trip data
      if (!trip.destination || !trip.arrivalDate || !trip.returnDate) {
        toast.error("Please complete trip details first")
        setLoadingPlan(false)
        return
      }

      const res = await apiFetch("/api/meal-plan", {
        trip: {
          ...trip,
          id: trip.id || generateId(),
          departureCity: trip.departureCity || "Home",
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
        arrivalDate: trip.arrivalDate || new Date().toISOString().split("T")[0],
        arrivalTime: trip.arrivalTime || "12:00",
        returnDate: trip.returnDate || new Date().toISOString().split("T")[0],
        returnTime: trip.returnTime || "12:00",
        timezoneShift: 0,
        layovers: trip.layovers || [],
        selectedDishes: trip.selectedDishes || [],
        selectedBeverages: trip.selectedBeverages || [],
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

  function toggleBeverage(beverage: LocalBeverage) {
    const selected = trip.selectedBeverages || []
    const exists = selected.find((b) => b.name === beverage.name)
    const newSelectedBeverages = exists
      ? selected.filter((b) => b.name !== beverage.name)
      : [...selected, beverage]

    setTrip({
      ...trip,
      selectedBeverages: newSelectedBeverages,
    })

    if (!exists) {
      toast.success(`${beverage.name} ${t('added', language) || 'added'}`, { duration: 1000 })
    }
  }

  async function handleComplete(choice?: "ai" | "dietitian") {
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
        arrivalDate: trip.arrivalDate || new Date().toISOString().split("T")[0],
        arrivalTime: trip.arrivalTime || "12:00",
        returnDate: trip.returnDate || new Date().toISOString().split("T")[0],
        returnTime: trip.returnTime || "12:00",
        timezoneShift: 0,
        layovers: trip.layovers || [],
        selectedDishes: trip.selectedDishes || [],
        selectedBeverages: trip.selectedBeverages || [],
        mealPlan: mealPlan
          ? {
            ...mealPlan,
            status:
              choice === "dietitian"
                ? "dietitian-verified"
                : choice === "ai"
                  ? "ai-generated"
                  : mealPlan.status,
          }
          : null,
      }
      saveTrip(fullTrip)
      setActiveTrip(fullTrip.id)
    }

    onComplete()
  }

  async function handlePlanConfirmation() {
    if (!reviewChoice || isSimulatingDietitianReview) return

    if (reviewChoice === "ai") {
      await handleComplete("ai")
      return
    }

    if (dietitianReviewCompleted) {
      await handleComplete("dietitian")
      return
    }

    const nutritionist = NUTRITIONIST_BY_DESTINATION[trip.destination || ""] || DEFAULT_NUTRITIONIST
    setReviewedNutritionist(nutritionist)
    setIsSimulatingDietitianReview(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsSimulatingDietitianReview(false)
    setDietitianReviewCompleted(true)
    toast.success(t('dietitianReviewComplete', language))
  }

  function selectReviewChoice(choice: "ai" | "dietitian") {
    setReviewChoice(choice)
    setDietitianReviewCompleted(false)
    setReviewedNutritionist(null)
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

  async function connectNutrium() {
    if (isConnectingNutrium || nutriumConnected) return
    setIsConnectingNutrium(true)
    try {
      const res = await apiFetch("/api/nutrition-goals", {
        sex: profile.sex || "male",
        age: profile.age || 25,
        height: profile.height || 170,
        weight: profile.weight || 70,
      })
      const data = await res.json()
      // Simulate a minimum connection time for the animation
      await new Promise((resolve) => setTimeout(resolve, 2500))
      if (data.dailyCalorieTarget) {
        setProfile({
          ...profile,
          dailyCalorieTarget: data.dailyCalorieTarget,
          macros: data.macros || { protein: 150, carbs: 250, fat: 67 },
          waterTarget: data.waterTarget || 2500,
        })
      }
      setNutriumConnected(true)
      toast.success(t('nutriumSynced', language) || 'Nutrition plan synced successfully')
    } catch {
      // Fallback calculation
      await new Promise((resolve) => setTimeout(resolve, 2500))
      const weight = profile.weight || 70
      const height = profile.height || 170
      const age = profile.age || 25
      const sex = profile.sex || "male"
      let bmr: number
      if (sex === "female") {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161
      } else {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5
      }
      const tdee = Math.round(bmr * 1.55)
      const protein = Math.round((tdee * 0.3) / 4)
      const fat = Math.round((tdee * 0.25) / 9)
      const carbs = Math.round((tdee - protein * 4 - fat * 9) / 4)
      setProfile({
        ...profile,
        dailyCalorieTarget: tdee,
        macros: { protein, carbs, fat },
        waterTarget: Math.round(weight * 35),
      })
      setNutriumConnected(true)
      toast.success(t('nutriumSynced', language) || 'Nutrition plan synced successfully')
    } finally {
      setIsConnectingNutrium(false)
    }
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

            {/* Step 1: Nutrium Connection */}
            {step === 1 && (
              <div className="flex flex-col items-center gap-6 py-4">
                {!nutriumConnected ? (
                  <>
                    {!isConnectingNutrium ? (
                      <div className="flex flex-col gap-4 w-full">
                        {/* Option 1: Connect with Nutrium */}
                        <button
                          onClick={() => { setNutritionMethod('nutrium'); connectNutrium() }}
                          className="group w-full rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.06] to-teal-600/[0.12] hover:from-emerald-500/[0.12] hover:to-teal-600/[0.20] p-5 shadow-sm hover:shadow-md transition-all duration-300 text-left cursor-pointer"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 flex-shrink-0">
                              <Wifi className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-base font-bold text-foreground">
                                {t('connectNutrium', language) || 'Connect with Nutrium'}
                              </h3>
                              <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                                {t('nutriumDescription', language) || 'Import your current nutrition plan from Nutrium app'}
                              </p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-emerald-500 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                          </div>
                        </button>

                        {/* Divider */}
                        <div className="flex items-center gap-3 px-2">
                          <div className="flex-1 h-px bg-border" />
                          <span className="text-xs text-muted-foreground font-medium">{t('or', language) || 'or'}</span>
                          <div className="flex-1 h-px bg-border" />
                        </div>

                        {/* Option 2: Estimate based on my info */}
                        <button
                          onClick={() => { setNutritionMethod('estimate'); connectNutrium() }}
                          className="group w-full rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.04] to-primary/[0.10] hover:from-primary/[0.08] hover:to-primary/[0.16] p-5 shadow-sm hover:shadow-md transition-all duration-300 text-left cursor-pointer"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 flex-shrink-0">
                              <Target className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-base font-bold text-foreground">
                                {t('estimateFromInfo', language) || 'Estimate from My Info'}
                              </h3>
                              <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                                {t('estimateFromInfoDesc', language) || 'Calculate nutrition goals based on your profile data'}
                              </p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-primary opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                          </div>
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg shadow-emerald-500/30">
                            <Loader2 className="h-8 w-8 animate-spin text-white" />
                          </div>
                          <span className="absolute inset-0 rounded-full animate-ping bg-emerald-400/30" />
                          <span className="absolute -inset-2 rounded-full animate-pulse border-2 border-emerald-400/40" />
                          <span className="absolute -inset-4 rounded-full animate-pulse border border-emerald-400/20" style={{ animationDelay: '0.5s' }} />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">
                          {nutritionMethod === 'estimate'
                            ? (t('estimatingNutrition', language) || 'Estimating your goals...')
                            : (t('connectingNutrium', language) || 'Connecting to Nutrium...')}
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-[280px] leading-relaxed text-center">
                          {nutritionMethod === 'estimate'
                            ? (t('calculatingFromProfile', language) || 'Calculating nutrition goals from your profile...')
                            : (t('importingFromNutrium', language) || 'Importing your current nutrition plan...')}
                        </p>
                        <div className="flex flex-col items-center gap-2 mt-2">
                          <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                              <div
                                key={i}
                                className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce"
                                style={{ animationDelay: `${i * 0.15}s` }}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {t('syncingData', language) || 'Syncing data...'}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-5 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 ring-4 ring-emerald-500/20">
                      <Check className="h-8 w-8 text-emerald-500" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-bold text-foreground">
                        {nutritionMethod === 'estimate'
                          ? (t('goalsEstimated', language) || 'Goals Estimated')
                          : (t('nutriumConnected', language) || 'Connected to Nutrium')}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {nutritionMethod === 'estimate'
                          ? (t('goalsCalculatedSuccess', language) || 'Nutrition goals calculated successfully')
                          : (t('nutriumSynced', language) || 'Nutrition plan synced successfully')}
                      </p>
                    </div>
                    <Card className="w-full border border-emerald-500/20 bg-emerald-500/5 shadow-none">
                      <CardContent className="p-4">
                        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-3 uppercase tracking-wider">
                          {t('nutritionPlan', language) || 'Your Nutrition Plan'}
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-lg bg-background/80 p-3 text-center">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{t('calories', language)}</p>
                            <p className="text-xl font-bold text-foreground">{profile.dailyCalorieTarget}</p>
                            <p className="text-[10px] text-muted-foreground">kcal / {t('dailyCalorieTarget', language)?.toLowerCase().includes('diár') ? 'dia' : 'day'}</p>
                          </div>
                          <div className="rounded-lg bg-background/80 p-3 text-center">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{t('waterTarget', language)}</p>
                            <p className="text-xl font-bold text-foreground">{profile.waterTarget}</p>
                            <p className="text-[10px] text-muted-foreground">ml</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-3">
                          <div className="rounded-lg bg-background/80 p-2.5 text-center">
                            <p className="text-[10px] text-muted-foreground">{t('protein', language)}</p>
                            <p className="text-base font-semibold text-foreground">{profile.macros?.protein}g</p>
                          </div>
                          <div className="rounded-lg bg-background/80 p-2.5 text-center">
                            <p className="text-[10px] text-muted-foreground">{t('carbs', language)}</p>
                            <p className="text-base font-semibold text-foreground">{profile.macros?.carbs}g</p>
                          </div>
                          <div className="rounded-lg bg-background/80 p-2.5 text-center">
                            <p className="text-[10px] text-muted-foreground">{t('fat', language)}</p>
                            <p className="text-base font-semibold text-foreground">{profile.macros?.fat}g</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
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
                  <Input
                    id="destination"
                    placeholder={t('selectDestination', language) || 'e.g. Portugal, New Zealand, Japan...'}
                    value={trip.destination}
                    onChange={(e) =>
                      setTrip({ ...trip, destination: e.target.value })
                    }
                    className="h-11"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="arr-date">{t('arrivalAtDest', language) || 'Arrival at Destination'}</Label>
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
                    <Label htmlFor="arr-time">{t('arrivalTimeAtDest', language) || 'Arrival Time'}</Label>
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="ret-date">{t('departureFromDest', language) || 'Departure from Destination'}</Label>
                    <Input
                      id="ret-date"
                      type="date"
                      value={trip.returnDate}
                      onChange={(e) =>
                        setTrip({ ...trip, returnDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="ret-time">{t('departureTimeFromDest', language) || 'Departure Time'}</Label>
                    <Input
                      id="ret-time"
                      type="time"
                      value={trip.returnTime}
                      onChange={(e) =>
                        setTrip({ ...trip, returnTime: e.target.value })
                      }
                    />
                  </div>
                </div>
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

                    <div>
                      <h3 className="mb-2 text-sm font-semibold text-foreground">
                        {t('mustTryBeverages', language)}
                      </h3>
                      {(() => {
                        const beveragesToShow = localBeverages.filter((b) => b.worthTrying)

                        if (beveragesToShow.length === 0) {
                          return (
                            <p className="text-sm text-muted-foreground italic">
                              {t('noBeveragesSelected', language)}
                            </p>
                          )
                        }

                        return (
                          <div className="flex flex-col gap-2">
                            {beveragesToShow.map((beverage) => {
                              const isSelected = trip.selectedBeverages?.some(
                                (b) => b.name === beverage.name
                              )
                              const realAllergies = profile.allergies?.filter((a) => a !== "Not Know") || []
                              const hasAllergenConflict = beverage.allergens.some(
                                (a) => realAllergies.includes(a)
                              )

                              return (
                                <Card
                                  key={beverage.name}
                                  className={cn(
                                    "cursor-pointer border-2 transition-all duration-200",
                                    isSelected
                                      ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/20"
                                      : "border-border bg-card hover:border-primary/30",
                                    hasAllergenConflict && "border-destructive/50 opacity-60"
                                  )}
                                  onClick={() => {
                                    if (hasAllergenConflict) {
                                      toast.error(
                                        `${t('contains', language) || 'Contains'}: ${beverage.allergens.join(", ")}`
                                      )
                                      return
                                    }
                                    toggleBeverage(beverage)
                                  }}
                                >
                                  <CardContent className="flex items-center justify-between p-3">
                                    <div className="flex flex-col gap-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-foreground">
                                          {beverage.name}
                                        </span>
                                        <Badge variant="outline" className="text-[10px]">
                                          {beverage.type === "alcoholic"
                                            ? t('alcoholic', language)
                                            : t('nonAlcoholic', language)}
                                        </Badge>
                                        {hasAllergenConflict && (
                                          <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                                        )}
                                      </div>
                                      <span className="text-xs text-muted-foreground">
                                        {beverage.description}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        ~{beverage.estimatedCalories} {t('calories', language)}
                                      </span>
                                      <span className="text-[10px] text-primary">
                                        {t('worthTrying', language)}: {beverage.whyWorthTrying}
                                      </span>
                                      {beverage.allergens.length > 0 && (
                                        <span className="text-[10px] text-muted-foreground">
                                          {t('allergens', language) || 'Allergens'}: {beverage.allergens.join(", ")}
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
                        )
                      })()}
                    </div>
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
                            Based on your goals, allergies, dietary preferences, timezone, and local cuisine culture.
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Caffeine Schedule */}
                    {mealPlan.caffeineSchedule && mealPlan.caffeineSchedule.length > 0 && (
                      <Card className="border border-amber-500/30 bg-amber-500/5 shadow-none">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-base">☕</span>
                            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                              {t('caffeineSchedule', language) || 'Caffeine Schedule for Jetlag'}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2">
                            {mealPlan.caffeineSchedule.map((item: CaffeineRecommendation, idx: number) => (
                              <div key={idx} className="flex items-start gap-2 rounded-lg bg-background/80 p-2.5">
                                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 min-w-[45px]">
                                  {item.time}
                                </span>
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-sm font-medium text-foreground">
                                    {item.recommendation}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground">
                                    {item.reason}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <div className="max-h-[400px] overflow-y-auto pr-2 flex flex-col gap-2">
                      {mealPlan.days.map((day) => (
                        <Card key={day.date} className="border-0 bg-card shadow-sm">
                          <CardContent className="p-4">
                            <p className="mb-1 text-xs font-medium text-muted-foreground">
                              {day.date}
                            </p>
                            {day.culturalNotes && (
                              <p className="mb-3 text-[11px] text-primary/80 italic">
                                💡 {day.culturalNotes}
                              </p>
                            )}
                            <div className="flex flex-col gap-2">
                              {day.meals.map((meal) => (
                                <div
                                  key={meal.id}
                                  className="flex items-center justify-between rounded-lg bg-muted/50 p-2.5"
                                >
                                  <div className="flex-1 min-w-0">
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
                                    {meal.notes && (
                                      <p className="mt-0.5 text-[10px] text-muted-foreground leading-tight">
                                        {meal.notes}
                                      </p>
                                    )}
                                  </div>
                                  <div className="text-right ml-2 flex-shrink-0">
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

            {/* Step 7: Plan Confirmation */}
            {step === 7 && (
              <div className="flex flex-col gap-4">
                <Card className="border border-primary/20 bg-primary/5 shadow-none">
                  <CardContent className="p-4">
                    <p className="text-sm font-medium text-foreground">
                      {t('choosePlanPath', language)}
                    </p>
                    {!mealPlan && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t('noDetailedPlanToReview', language)}
                      </p>
                    )}
                  </CardContent>
                </Card>

                <button
                  type="button"
                  onClick={() => selectReviewChoice("ai")}
                  disabled={isSimulatingDietitianReview}
                  className={cn(
                    "rounded-lg border px-4 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                    reviewChoice === "ai"
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-primary/40"
                  )}
                >
                  <p className="text-sm font-semibold text-foreground">
                    {t('continueWithProvidedPlan', language)}
                  </p>
                </button>

                <button
                  type="button"
                  disabled={!mealPlan || isSimulatingDietitianReview}
                  onClick={() => selectReviewChoice("dietitian")}
                  className={cn(
                    "rounded-lg border px-4 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                    reviewChoice === "dietitian"
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-primary/40"
                  )}
                >
                  <p className="text-sm font-semibold text-foreground">
                    {t('requestLocalDietitianReview', language)}
                  </p>
                  {!mealPlan && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t('proceedToApp', language)}
                    </p>
                  )}
                </button>

                {dietitianReviewCompleted && reviewedNutritionist && (
                  <Card className="border border-primary/30 bg-primary/5 shadow-none">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Image
                          src={reviewedNutritionist.photoUrl}
                          alt={reviewedNutritionist.name}
                          width={52}
                          height={52}
                          className="h-13 w-13 rounded-full border border-primary/20 object-cover"
                        />
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {t('reviewCompleted', language)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t('nutritionistReviewLabel', language)}
                          </p>
                        </div>
                        <Check className="ml-auto h-5 w-5 text-primary" />
                      </div>
                      <p className="mt-3 text-sm text-foreground">
                        {t('dietitianReviewedSuccessBy', language)} {reviewedNutritionist.name}
                      </p>
                    </CardContent>
                  </Card>
                )}
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
            onClick={() => {
              if (step === steps.length - 1) {
                setReviewChoice(null)
                setDietitianReviewCompleted(false)
                setReviewedNutritionist(null)
                setIsSimulatingDietitianReview(false)
              }
              setStep(step - 1)
            }}
            disabled={isSimulatingDietitianReview}
            className="flex-1 h-12 font-semibold shadow-sm hover:shadow transition-all"
          >
            <ChevronLeft className="mr-1.5 h-5 w-5" />
            {t('back', language)}
          </Button>
        )}
        <Button
          onClick={async () => {
            if (step < steps.length - 1) {
              const nextStep = step + 1

              setStep(nextStep)
              // Trigger data fetching for next steps
              if (nextStep === 5) { // Local Cuisine
                fetchLocalDishes()
              }
              if (nextStep === 6) { // Meal Plan
                generateMealPlan()
              }
            } else {
              await handlePlanConfirmation()
            }
          }}
          disabled={
            isSimulatingDietitianReview ||
            (step === steps.length - 1 && !reviewChoice)
          }
          className="flex-1 h-12 font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg transition-all"
        >
          {isSimulatingDietitianReview ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : step < steps.length - 1 ? (
            <>
              {t('next', language)}
              <ChevronRight className="ml-1.5 h-5 w-5" />
            </>
          ) : step === steps.length - 2 ? (
            t('finish', language)
          ) : step === steps.length - 1 && reviewChoice === "dietitian" && !dietitianReviewCompleted ? (
            t('requestLocalDietitianReview', language)
          ) : step === steps.length - 1 ? (
            t('proceedToApp', language)
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

function getDefaultBeverages(destination: string): LocalBeverage[] {
  const beverages: Record<string, LocalBeverage[]> = {
    Japan: [
      { name: "Matcha", type: "non-alcoholic", description: "Traditional powdered green tea with deep umami and ceremonial heritage.", estimatedCalories: 10, allergens: [], worthTrying: true, whyWorthTrying: "Iconic tea ritual tied to Japanese culture." },
      { name: "Sake", type: "alcoholic", description: "Fermented rice drink served warm or chilled depending on style and season.", estimatedCalories: 135, allergens: [], worthTrying: true, whyWorthTrying: "Classic national drink with regional varieties." },
      { name: "Umeshu", type: "alcoholic", description: "Sweet plum liqueur often served over ice or mixed with soda.", estimatedCalories: 160, allergens: [], worthTrying: true, whyWorthTrying: "Popular local aperitif with distinct plum flavor." },
    ],
    Italy: [
      { name: "Espresso", type: "non-alcoholic", description: "Small, intense coffee that anchors daily Italian café culture.", estimatedCalories: 5, allergens: [], worthTrying: true, whyWorthTrying: "Essential part of authentic Italian routine." },
      { name: "Aperol Spritz", type: "alcoholic", description: "Bubbly bittersweet aperitif cocktail enjoyed before dinner.", estimatedCalories: 125, allergens: [], worthTrying: true, whyWorthTrying: "Famous aperitivo drink across Italian cities." },
      { name: "Limoncello", type: "alcoholic", description: "Sweet lemon liqueur typically served chilled after meals.", estimatedCalories: 155, allergens: [], worthTrying: true, whyWorthTrying: "Southern Italian digestif with strong local identity." },
    ],
    Mexico: [
      { name: "Horchata", type: "non-alcoholic", description: "Sweet rice-based drink with cinnamon, often served cold.", estimatedCalories: 180, allergens: ["Dairy"], worthTrying: true, whyWorthTrying: "Widely loved traditional refreshment in Mexico." },
      { name: "Agua de Jamaica", type: "non-alcoholic", description: "Hibiscus infusion with tart, refreshing flavor.", estimatedCalories: 90, allergens: [], worthTrying: true, whyWorthTrying: "Traditional and common in local eateries." },
      { name: "Mezcal", type: "alcoholic", description: "Agave spirit with smoky profile and artisanal production roots.", estimatedCalories: 140, allergens: [], worthTrying: true, whyWorthTrying: "Distinctive spirit deeply linked to regional traditions." },
    ],
    Thailand: [
      { name: "Thai Iced Tea", type: "non-alcoholic", description: "Black tea with condensed milk and spices, served over ice.", estimatedCalories: 180, allergens: ["Dairy"], worthTrying: true, whyWorthTrying: "Street-food staple with unmistakable flavor." },
      { name: "Nam Manao", type: "non-alcoholic", description: "Fresh lime drink with light sweetness, ideal in tropical heat.", estimatedCalories: 70, allergens: [], worthTrying: true, whyWorthTrying: "Refreshing local drink found across markets." },
      { name: "Singha Beer", type: "alcoholic", description: "Classic Thai lager commonly paired with spicy dishes.", estimatedCalories: 150, allergens: ["Wheat"], worthTrying: true, whyWorthTrying: "Recognizable local beer for cultural pairing." },
    ],
  }

  return beverages[destination] || []
}

function getDefaultMealPlan(trip: Trip): MealPlan {
  const startDate = trip.arrivalDate || new Date().toISOString().split("T")[0]
  return {
    id: generateId(),
    tripId: trip.id,
    status: "ai-generated",
    days: [
      {
        date: startDate,
        adjustedTimezone: 0,
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
