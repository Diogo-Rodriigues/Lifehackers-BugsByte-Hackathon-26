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
  timezoneShift: number // hours
  layovers: string[]
  selectedDishes: LocalDish[]
  mealPlan: MealPlan | null
}

export interface LocalDish {
  name: string
  category: "soups" | "main" | "desserts" | "snacks"
  description: string
  estimatedCalories: number
  allergens: string[]
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
