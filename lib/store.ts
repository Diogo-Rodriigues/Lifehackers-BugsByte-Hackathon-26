"use client"

import type {
  UserProfile,
  Trip,
  DailyLog,
  MealLog,
} from "./types"

const STORAGE_KEYS = {
  PROFILE: "nutrifuel_profile",
  TRIPS: "nutrifuel_trips",
  DAILY_LOGS: "nutrifuel_daily_logs",
  ACTIVE_TRIP: "nutrifuel_active_trip",
  API_KEY: "nutrifuel_openai_key",
  ALLERGY_OPTIONS: "nutrifuel_allergy_options",
  DIET_OPTIONS: "nutrifuel_diet_options",
} as const

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function setItem(key: string, value: unknown) {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(value))
}

// Profile
export function getProfile(): UserProfile | null {
  return getItem<UserProfile | null>(STORAGE_KEYS.PROFILE, null)
}

export function saveProfile(profile: UserProfile) {
  setItem(STORAGE_KEYS.PROFILE, profile)
}

// Trips
export function getTrips(): Trip[] {
  return getItem<Trip[]>(STORAGE_KEYS.TRIPS, [])
}

export function saveTrip(trip: Trip) {
  const trips = getTrips()
  const idx = trips.findIndex((t) => t.id === trip.id)
  if (idx >= 0) {
    trips[idx] = trip
  } else {
    trips.push(trip)
  }
  setItem(STORAGE_KEYS.TRIPS, trips)
}

export function getActiveTrip(): Trip | null {
  const id = getItem<string | null>(STORAGE_KEYS.ACTIVE_TRIP, null)
  if (!id) return null
  return getTrips().find((t) => t.id === id) ?? null
}

export function setActiveTrip(tripId: string) {
  setItem(STORAGE_KEYS.ACTIVE_TRIP, tripId)
}

// Daily Logs
export function getDailyLogs(): DailyLog[] {
  return getItem<DailyLog[]>(STORAGE_KEYS.DAILY_LOGS, [])
}

export function getDailyLog(date: string): DailyLog {
  const logs = getDailyLogs()
  return (
    logs.find((l) => l.date === date) ?? {
      date,
      meals: [],
      waterIntake: 0,
      steps: 0,
      activityLevel: "sedentary",
      activityNotes: "",
    }
  )
}

export function saveDailyLog(log: DailyLog) {
  const logs = getDailyLogs()
  const idx = logs.findIndex((l) => l.date === log.date)
  if (idx >= 0) {
    logs[idx] = log
  } else {
    logs.push(log)
  }
  setItem(STORAGE_KEYS.DAILY_LOGS, logs)
}

export function addMealToLog(date: string, meal: MealLog) {
  const log = getDailyLog(date)
  log.meals.push(meal)
  saveDailyLog(log)
  return log
}

// API Key
export function getApiKey(): string {
  return getItem<string>(STORAGE_KEYS.API_KEY, "")
}

export function saveApiKey(key: string) {
  setItem(STORAGE_KEYS.API_KEY, key)
}

// Options
export function getAllergyOptions(fallback: string[]): string[] {
  return getItem<string[]>(STORAGE_KEYS.ALLERGY_OPTIONS, fallback)
}

export function saveAllergyOptions(options: string[]) {
  setItem(STORAGE_KEYS.ALLERGY_OPTIONS, options)
}

export function getDietOptions(fallback: string[]): string[] {
  return getItem<string[]>(STORAGE_KEYS.DIET_OPTIONS, fallback)
}

export function saveDietOptions(options: string[]) {
  setItem(STORAGE_KEYS.DIET_OPTIONS, options)
}

// Helpers
export function todayString(): string {
  return new Date().toISOString().split("T")[0]
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
