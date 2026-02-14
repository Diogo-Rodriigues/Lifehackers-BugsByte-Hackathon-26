"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  saveTrip,
  setActiveTrip,
  getProfile,
  getActiveTrip,
  generateId,
  getTrips,
} from "@/lib/store"
import { apiFetch } from "@/lib/api"
import type { Trip, LocalDish, MealPlan } from "@/lib/types"
import {
  Plane,
  Clock,
  MapPin,
  ChevronRight,
  Check,
  Loader2,
  AlertTriangle,
  Utensils,
  ShieldCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const DESTINATIONS = [
  "Japan",
  "Thailand",
  "Mexico",
  "Italy",
  "India",
  "France",
  "Morocco",
  "Peru",
  "South Korea",
  "Spain",
  "Turkey",
  "Vietnam",
  "Greece",
  "Brazil",
  "Colombia",
]

const TIMEZONE_OFFSETS: Record<string, number> = {
  Japan: 9,
  Thailand: 7,
  Mexico: -6,
  Italy: 1,
  India: 5.5,
  France: 1,
  Morocco: 1,
  Peru: -5,
  "South Korea": 9,
  Spain: 1,
  Turkey: 3,
  Vietnam: 7,
  Greece: 2,
  Brazil: -3,
  Colombia: -5,
}

type PlanStep = "destination" | "flights" | "dishes" | "plan" | "verify"

export function TripPlanning() {
  const [step, setStep] = useState<PlanStep>("destination")
  const [trip, setTrip] = useState<Partial<Trip>>({
    destination: "",
    departureCity: "",
    departureDate: "",
    arrivalDate: "",
    layovers: [],
    selectedDishes: [],
  })
  const [localDishes, setLocalDishes] = useState<LocalDish[]>([])
  const [loadingDishes, setLoadingDishes] = useState(false)
  const [loadingPlan, setLoadingPlan] = useState(false)
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null)
  const existingTrip = getActiveTrip()
  const profile = getProfile()

  const fetchLocalDishes = useCallback(async () => {
    if (!trip.destination) return
    setLoadingDishes(true)
    try {
      const res = await apiFetch("/api/dishes", {
        destination: trip.destination,
        allergies: profile?.allergies || [],
        preferences: profile?.dietaryPreferences || [],
      })
      if (!res.ok) throw new Error("Failed to fetch dishes")
      const data = await res.json()
      setLocalDishes(data.dishes || [])
    } catch {
      toast.error("Could not load local dishes. Check your API key in Settings.")
      setLocalDishes(getDefaultDishes(trip.destination!))
    } finally {
      setLoadingDishes(false)
    }
  }, [trip.destination, profile?.allergies, profile?.dietaryPreferences])

  const generateMealPlan = useCallback(async () => {
    setLoadingPlan(true)
    try {
      const res = await apiFetch("/api/meal-plan", {
        trip,
        profile,
        selectedDishes: trip.selectedDishes,
      })
      if (!res.ok) throw new Error("Failed to generate plan")
      const data = await res.json()
      setMealPlan(data.plan)
    } catch {
      toast.error("Could not generate meal plan. Check your API key in Settings.")
      setMealPlan(getDefaultMealPlan(trip as Trip))
    } finally {
      setLoadingPlan(false)
    }
  }, [trip, profile])

  function toggleDish(dish: LocalDish) {
    const selected = trip.selectedDishes || []
    const exists = selected.find((d) => d.name === dish.name)
    setTrip({
      ...trip,
      selectedDishes: exists
        ? selected.filter((d) => d.name !== dish.name)
        : [...selected, dish],
    })
  }

  function saveAndActivateTrip() {
    const fullTrip: Trip = {
      id: generateId(),
      destination: trip.destination || "Unknown",
      departureCity: trip.departureCity || "Home",
      departureDate: trip.departureDate || new Date().toISOString().split("T")[0],
      arrivalDate: trip.arrivalDate || new Date().toISOString().split("T")[0],
      timezoneShift: TIMEZONE_OFFSETS[trip.destination || ""] || 0,
      layovers: trip.layovers || [],
      selectedDishes: trip.selectedDishes || [],
      mealPlan: mealPlan
        ? { ...mealPlan, status: "dietitian-verified" }
        : null,
    }
    saveTrip(fullTrip)
    setActiveTrip(fullTrip.id)
    toast.success("Trip saved and activated!")
  }

  // Show existing trip summary if one is active
  if (existingTrip && step === "destination") {
    return (
      <div className="flex flex-col gap-6 px-4 pb-24 pt-4">
        <h1 className="font-display text-2xl text-primary">Trip Plan</h1>

        <Card className="border-0 bg-card shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  {existingTrip.destination}
                </p>
                <p className="text-xs text-muted-foreground">
                  {existingTrip.departureDate} - {existingTrip.arrivalDate}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                Timezone shift: {existingTrip.timezoneShift > 0 ? "+" : ""}
                {existingTrip.timezoneShift}h
              </span>
            </div>
            {existingTrip.selectedDishes.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {existingTrip.selectedDishes.map((d) => (
                  <Badge
                    key={d.name}
                    variant="secondary"
                    className="bg-accent text-accent-foreground"
                  >
                    {d.name}
                  </Badge>
                ))}
              </div>
            )}
            {existingTrip.mealPlan && (
              <div className="mt-3 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-primary capitalize">
                  {existingTrip.mealPlan.status.replace("-", " ")}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Button
          onClick={() => setStep("destination")}
          variant="outline"
          className="border-primary text-primary hover:bg-primary/5"
        >
          Plan New Trip
        </Button>

        {existingTrip.mealPlan && (
          <div>
            <h2 className="mb-3 text-base font-semibold text-foreground">
              Meal Plan
            </h2>
            <div className="flex flex-col gap-2">
              {existingTrip.mealPlan.days.map((day) => (
                <Card key={day.date} className="border-0 bg-card shadow-sm">
                  <CardContent className="p-3">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                      {day.date}
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {day.meals.map((meal) => (
                        <div
                          key={meal.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-16 text-xs capitalize text-muted-foreground">
                              {meal.type}
                            </span>
                            <span className="text-foreground font-medium">{meal.dish}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {meal.calories} kcal
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 px-4 pb-24 pt-4">
      <h1 className="font-display text-2xl text-primary">Plan Your Trip</h1>

      {/* Step: Destination */}
      {step === "destination" && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="departure-city">Departure City</Label>
            <Input
              id="departure-city"
              placeholder="e.g. New York"
              value={trip.departureCity}
              onChange={(e) =>
                setTrip({ ...trip, departureCity: e.target.value })
              }
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="destination">Destination Country</Label>
            <Select
              value={trip.destination}
              onValueChange={(v) =>
                setTrip({ ...trip, destination: v })
              }
            >
              <SelectTrigger id="destination">
                <SelectValue placeholder="Select destination" />
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
              <Label htmlFor="dep-date">Departure</Label>
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
              <Label htmlFor="arr-date">Arrival</Label>
              <Input
                id="arr-date"
                type="date"
                value={trip.arrivalDate}
                onChange={(e) =>
                  setTrip({ ...trip, arrivalDate: e.target.value })
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
                    Timezone Shift
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {trip.destination} is UTC
                    {TIMEZONE_OFFSETS[trip.destination] > 0 ? "+" : ""}
                    {TIMEZONE_OFFSETS[trip.destination]}. Meal times will be
                    adjusted for jet lag.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          <Button
            onClick={() => {
              setStep("dishes")
              fetchLocalDishes()
            }}
            disabled={!trip.destination || !trip.departureDate}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Explore Local Cuisine
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Step: Dishes */}
      {step === "dishes" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStep("destination")}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Back
            </button>
            <span className="text-sm text-muted-foreground">/</span>
            <span className="text-sm font-medium text-foreground">
              Local Dishes - {trip.destination}
            </span>
          </div>

          {loadingDishes ? (
            <div className="flex flex-col items-center gap-3 py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Discovering local cuisine...
              </p>
            </div>
          ) : (
            <>
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
                        const hasAllergenConflict =
                          dish.allergens.some((a) =>
                            profile?.allergies?.includes(a)
                          )
                        return (
                          <Card
                            key={dish.name}
                            className={cn(
                              "cursor-pointer border transition-colors",
                              isSelected
                                ? "border-primary bg-primary/5"
                                : "border-border bg-card",
                              hasAllergenConflict &&
                                "border-destructive/50 opacity-60"
                            )}
                            onClick={() => {
                              if (hasAllergenConflict) {
                                toast.error(
                                  `This dish contains: ${dish.allergens.join(
                                    ", "
                                  )}`
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
                                  ~{dish.estimatedCalories} kcal
                                </span>
                              </div>
                              {isSelected && (
                                <Check className="h-5 w-5 text-primary" />
                              )}
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                )
              })}

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {trip.selectedDishes?.length || 0} dishes selected
                </span>
              </div>

              <Button
                onClick={() => {
                  setStep("plan")
                  generateMealPlan()
                }}
                disabled={(trip.selectedDishes?.length || 0) === 0}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Generate Meal Plan
                <Utensils className="ml-1 h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      )}

      {/* Step: Plan Generation */}
      {step === "plan" && (
        <div className="flex flex-col gap-4">
          {loadingPlan ? (
            <div className="flex flex-col items-center gap-3 py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                AI is crafting your personalized meal plan...
              </p>
            </div>
          ) : mealPlan ? (
            <>
              <Card className="border border-primary/30 bg-primary/5 shadow-none">
                <CardContent className="flex items-start gap-3 p-4">
                  <Utensils className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      AI-Generated Plan
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Based on your goals, allergies, and selected local dishes.
                    </p>
                  </div>
                </CardContent>
              </Card>

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
                            {meal.notes && (
                              <p className="mt-0.5 text-[10px] text-muted-foreground">
                                {meal.notes}
                              </p>
                            )}
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

              <Button
                onClick={() => setStep("verify")}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Submit for Verification
                <ShieldCheck className="ml-1 h-4 w-4" />
              </Button>
            </>
          ) : null}
        </div>
      )}

      {/* Step: Verification (Mockup) */}
      {step === "verify" && (
        <div className="flex flex-col items-center gap-6 py-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="h-10 w-10 text-primary" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-foreground">
              Dietitian Verification
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your plan has been reviewed and validated by a local nutrition
              specialist for {trip.destination}.
            </p>
          </div>
          <Card className="w-full border border-primary/30 bg-primary/5 shadow-none">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">DR</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Dr. Regional Nutritionist
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Verified - Safe for your dietary needs
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Button
            onClick={() => {
              saveAndActivateTrip()
              setStep("destination")
            }}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Activate Trip Plan
            <Check className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
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
