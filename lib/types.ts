export interface UserProfile {
  name: string
  age: number
  sex: "male" | "female" | "other"
  height: number // cm
  weight: number // kg
  goal: "lose" | "maintain" | "gain"
  allergies: string[]
  dietaryPreferences: string[]
  dailyCalorieTarget: number
  macros: { protein: number; carbs: number; fat: number } // grams
  waterTarget: number // ml
  onboardingComplete: boolean
}

export interface Trip {
  id: string
  destination: string
  departureCity: string
  departureDate: string
  arrivalDate: string
  departureTime: string
  arrivalTime: string
  timezoneShift: number // hours
  layovers: string[]
  selectedDishes: LocalDish[]
  selectedBeverages: LocalBeverage[]
  mealPlan: MealPlan | null
  status: "active" | "completed"
  completedAt?: string
  postTripAnalysis?: TripDietAnalysis
  nutriumSync?: NutriumSyncStatus
}

export interface TripDietAnalysis {
  tripId: string
  generatedAt: string
  daysAnalyzed: number
  totalMeals: number
  avgCaloriesPerDay: number
  avgWaterPerDay: number
  avgStepsPerDay: number
  offPlanMeals: number
  hydrationTargetHitDays: number
  adherenceScore: number
  highlights: string[]
}

export interface NutriumSyncStatus {
  status: "not-sent" | "sending" | "sent" | "failed"
  lastAttemptAt?: string
  lastSentAt: string
  syncId: string
  message: string
}

export interface LocalDish {
  name: string
  category: "soups" | "main" | "desserts" | "snacks"
  description: string
  estimatedCalories: number
  allergens: string[]
}

export interface LocalBeverage {
  name: string
  type: "alcoholic" | "non-alcoholic"
  description: string
  estimatedCalories: number
  allergens: string[]
  worthTrying: boolean
  whyWorthTrying: string
}

export interface MealPlan {
  id: string
  tripId: string
  days: DayPlan[]
  status: "ai-generated" | "dietitian-verified" | "active"
}

export interface DayPlan {
  date: string
  meals: PlannedMeal[]
  adjustedTimezone: number
}

export interface PlannedMeal {
  id: string
  type: "breakfast" | "lunch" | "dinner" | "snack"
  suggestedTime: string
  dish: string
  calories: number
  protein: number
  carbs: number
  fat: number
  notes: string
}

export interface MealLog {
  id: string
  date: string
  time: string
  type: "breakfast" | "lunch" | "dinner" | "snack"
  name: string
  photoUrl?: string
  calories: number
  protein: number
  carbs: number
  fat: number
  ingredients: string[]
  allergenWarnings: string[]
  notes: string
  isOffPlan: boolean
}

export interface DailyLog {
  date: string
  meals: MealLog[]
  waterIntake: number // ml
  steps: number
  activityLevel: "sedentary" | "light" | "moderate" | "active"
  activityNotes: string
  weather?: WeatherSnapshot
  dynamicTargets?: DynamicTargets
  hydrationReminder?: {
    lastShownAt?: string
    shownCountToday?: number
  }
}

export interface WeatherSnapshot {
  temperatureC: number
  apparentTemperatureC?: number
  humidity?: number
  weatherCode?: number
  fetchedAt: string
}

export interface DynamicTargets {
  baseWaterTarget: number
  adjustedWaterTarget: number
  baseCalorieTarget: number
  adjustedCalorieTarget: number
  waterDelta: number
  calorieDelta: number
  stepDeltaWater: number
  stepDeltaCalories: number
  weatherDeltaWater: number
  weatherDeltaCalories: number
  remainingCalories: number
  needsHydrationAlert: boolean
  hydrationAlertKind?: "heat" | "activity" | "mixed" | "none"
  hydrationAlertSeasonal?: boolean
  hydrationAlertReason?: string
  strongAlert: boolean
  extraMealSuggestion?: {
    title: string
    reason: string
    estimatedCalories: number
  }
  lastUpdatedAt: string
}

export interface AnalysisResult {
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  ingredients: string[]
  allergenWarnings: string[]
  confidence: number
}
