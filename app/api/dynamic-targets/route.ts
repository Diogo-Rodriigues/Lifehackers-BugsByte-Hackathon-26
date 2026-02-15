import { NextRequest, NextResponse } from "next/server"

type DestinationCoords = { lat: number; lon: number }

const DESTINATION_COORDS: Record<string, DestinationCoords> = {
  Japan: { lat: 35.6762, lon: 139.6503 },
  Thailand: { lat: 13.7563, lon: 100.5018 },
  Mexico: { lat: 19.4326, lon: -99.1332 },
  Italy: { lat: 41.9028, lon: 12.4964 },
  India: { lat: 28.6139, lon: 77.209 },
  France: { lat: 48.8566, lon: 2.3522 },
  Morocco: { lat: 34.0209, lon: -6.8416 },
  Peru: { lat: -12.0464, lon: -77.0428 },
  "South Korea": { lat: 37.5665, lon: 126.978 },
  Spain: { lat: 40.4168, lon: -3.7038 },
  Turkey: { lat: 39.9334, lon: 32.8597 },
  Vietnam: { lat: 21.0278, lon: 105.8342 },
  Greece: { lat: 37.9838, lon: 23.7275 },
  Brazil: { lat: -15.7939, lon: -47.8828 },
  Colombia: { lat: 4.711, lon: -74.0721 },
}

async function fetchWeather(destination: string) {
  const coords = DESTINATION_COORDS[destination]
  if (!coords) return null

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code`
  const response = await fetch(url, { cache: "no-store" })
  if (!response.ok) return null

  const data = await response.json()
  const current = data?.current
  if (!current) return null

  return {
    temperatureC: Number(current.temperature_2m ?? 22),
    apparentTemperatureC: Number(current.apparent_temperature ?? current.temperature_2m ?? 22),
    humidity: Number(current.relative_humidity_2m ?? 50),
    weatherCode: Number(current.weather_code ?? 0),
    fetchedAt: new Date().toISOString(),
  }
}

function getWeatherWaterDelta(temp: number, humidity: number) {
  let delta = 0
  if (temp >= 32) delta += 900
  else if (temp >= 28) delta += 700
  else if (temp >= 24) delta += 400
  else if (temp < 10) delta -= 250
  else if (temp < 18) delta -= 150

  if (humidity >= 80) delta += 200
  else if (humidity <= 30) delta += 150
  return delta
}

function getWeatherCalorieDelta(temp: number) {
  if (temp >= 32) return 80
  if (temp >= 28) return 50
  return 0
}

function getSeasonalHeatBoost(destination: string, tripDate?: string): number {
  const date = tripDate ? new Date(tripDate) : new Date()
  const month = Number.isNaN(date.getTime()) ? new Date().getMonth() + 1 : date.getMonth() + 1

  const southHemisphere = new Set(["Brazil"])
  const tropicalWarm = new Set(["Thailand", "India", "Vietnam", "Colombia", "Mexico"])

  if (tropicalWarm.has(destination)) {
    return 2
  }

  if (southHemisphere.has(destination)) {
    if ([12, 1, 2].includes(month)) return 5
    if ([6, 7, 8].includes(month)) return -2
    return 1
  }

  if ([6, 7, 8].includes(month)) return 4
  if ([12, 1, 2].includes(month)) return -2
  return 0
}

function getSeasonContext(destination: string, tripDate?: string) {
  const date = tripDate ? new Date(tripDate) : new Date()
  const month = Number.isNaN(date.getTime()) ? new Date().getMonth() + 1 : date.getMonth() + 1
  const southHemisphere = new Set(["Brazil"])

  const isSummer = southHemisphere.has(destination)
    ? [12, 1, 2].includes(month)
    : [6, 7, 8].includes(month)

  return { isSummer }
}

async function getExtraMealSuggestion(input: {
  destination: string
  remainingCalories: number
  allergies: string[]
  dietaryPreferences: string[]
  selectedDishes: { name: string }[]
  apiKey: string
}) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Return ONLY JSON:
{
  "title": "traditional dish name",
  "reason": "short reason",
  "estimatedCalories": 150-350
}
Trip destination: ${input.destination}
Remaining calories: ${input.remainingCalories}
Allergies: ${input.allergies.join(", ") || "none"}
Preferences: ${input.dietaryPreferences.join(", ") || "none"}
Already selected dishes: ${input.selectedDishes.map((d) => d.name).join(", ") || "none"}
Constraints:
- suggest a traditional local option
- keep calories between 150 and 350
- never include allergens`,
        },
        { role: "user", content: "Suggest one optional extra local meal." },
      ],
      temperature: 0.6,
      max_tokens: 220,
    }),
  })

  if (!response.ok) return null
  const data = await response.json()
  const content = data?.choices?.[0]?.message?.content || ""
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return null
  try {
    const parsed = JSON.parse(jsonMatch[0])
    return {
      title: String(parsed.title || "Traditional local snack"),
      reason: String(parsed.reason || "Fits your remaining energy budget."),
      estimatedCalories: Math.min(350, Math.max(150, Number(parsed.estimatedCalories || 220))),
    }
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const profile = body?.profile || {}
    const dailyLog = body?.dailyLog || {}
    const destination = String(body?.destination || "")
    const selectedDishes = Array.isArray(body?.selectedDishes) ? body.selectedDishes : []
    const tripDate = typeof body?.tripDate === "string" ? body.tripDate : undefined

    const apiKey = req.headers.get("x-openai-key") || process.env.OPENAI_API_KEY || ""
    const weather = (await fetchWeather(destination)) || {
      temperatureC: 22,
      apparentTemperatureC: 22,
      humidity: 50,
      weatherCode: 0,
      fetchedAt: new Date().toISOString(),
    }

    const baseWaterTarget = Number(profile?.waterTarget || 2500)
    const baseCalorieTarget = Number(profile?.dailyCalorieTarget || 2000)
    const steps = Number(dailyLog?.steps || 0)
    const meals = Array.isArray(dailyLog?.meals) ? dailyLog.meals : []

    const consumedCalories = meals.reduce(
      (acc: number, meal: { calories?: number }) => acc + Number(meal?.calories || 0),
      0
    )

    const seasonalHeatBoost = getSeasonalHeatBoost(destination, tripDate)
    const effectiveTemperature = weather.temperatureC + seasonalHeatBoost
    const seasonContext = getSeasonContext(destination, tripDate)
    const rawWeatherDeltaWater = getWeatherWaterDelta(effectiveTemperature, Number(weather.humidity || 50))
    const stepDeltaWater = Math.min(1000, Math.max(0, Math.floor(Math.max(0, steps - 3000) / 3000) * 250))
    // In cold days, weather can reduce hydration need, but should not cancel high-activity hydration entirely.
    const weatherDeltaWater = stepDeltaWater >= 500
      ? Math.max(rawWeatherDeltaWater, -150)
      : rawWeatherDeltaWater
    const adjustedWaterTarget = Math.min(
      6000,
      Math.max(1500, baseWaterTarget + weatherDeltaWater + stepDeltaWater)
    )

    const stepDeltaCalories = Math.min(400, Math.max(0, Math.floor(steps / 1000) * 40))
    const weatherDeltaCalories = getWeatherCalorieDelta(effectiveTemperature)
    const adjustedCalorieTarget = baseCalorieTarget + stepDeltaCalories + weatherDeltaCalories
    const remainingCalories = Math.max(0, adjustedCalorieTarget - consumedCalories)

    const waterIncrease = adjustedWaterTarget - baseWaterTarget
    const heatDrivenNeed = waterIncrease > 300 && effectiveTemperature >= 28
    const activityDrivenNeed = waterIncrease > 300 && stepDeltaWater >= 500
    const seasonalActivityNeed =
      activityDrivenNeed && (seasonContext.isSummer || seasonalHeatBoost >= 4)
    const needsHydrationAlert = heatDrivenNeed || activityDrivenNeed
    const hydrationAlertKind = (heatDrivenNeed && activityDrivenNeed) || seasonalActivityNeed
      ? "mixed"
      : heatDrivenNeed
      ? "heat"
      : activityDrivenNeed
      ? "activity"
      : "none"
    const hydrationAlertReason = seasonalActivityNeed
      ? "Summer season and high activity increased hydration needs."
      : heatDrivenNeed
      ? "Hot weather detected and hydration target increased for today."
      : activityDrivenNeed
      ? "High activity detected and hydration target increased for today."
      : ""

    let extraMealSuggestion: { title: string; reason: string; estimatedCalories: number } | undefined
    if (remainingCalories >= 300 && apiKey) {
      const aiSuggestion = await getExtraMealSuggestion({
        destination,
        remainingCalories,
        allergies: profile?.allergies || [],
        dietaryPreferences: profile?.dietaryPreferences || [],
        selectedDishes,
        apiKey,
      })
      if (aiSuggestion) extraMealSuggestion = aiSuggestion
    }

    if (!extraMealSuggestion && remainingCalories >= 300) {
      extraMealSuggestion = {
        title: "Traditional local meal",
        reason: "You still have energy budget for one local option.",
        estimatedCalories: 250,
      }
    }

    const dynamicTargets = {
      baseWaterTarget,
      adjustedWaterTarget,
      baseCalorieTarget,
      adjustedCalorieTarget,
      waterDelta: adjustedWaterTarget - baseWaterTarget,
      calorieDelta: adjustedCalorieTarget - baseCalorieTarget,
      stepDeltaWater,
      stepDeltaCalories,
      weatherDeltaWater,
      weatherDeltaCalories,
      remainingCalories,
      needsHydrationAlert,
      hydrationAlertKind,
      hydrationAlertSeasonal: seasonalActivityNeed,
      hydrationAlertReason,
      strongAlert: needsHydrationAlert,
      extraMealSuggestion,
      lastUpdatedAt: new Date().toISOString(),
    }

    return NextResponse.json({ weather, dynamicTargets })
  } catch (error) {
    console.error("Dynamic targets error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
