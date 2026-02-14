import { NextRequest, NextResponse } from "next/server"
import { MEAL_CULTURE, type DestinationKey } from "@/lib/meal-culture"

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export async function POST(req: NextRequest) {
  try {
    const { trip, profile, selectedDishes } = await req.json()

    console.log("Meal plan request received:", {
      destination: trip?.destination,
      departureDate: trip?.departureDate,
      arrivalDate: trip?.arrivalDate,
      hasProfile: !!profile,
      dishCount: selectedDishes?.length || 0,
    })

    const apiKey =
      req.headers.get("x-openai-key") || process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.error("No API key found")
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 401 }
      )
    }

    if (!trip?.destination || !trip?.departureDate || !trip?.arrivalDate) {
      console.error("Missing required trip fields:", { trip })
      return NextResponse.json(
        { error: "Missing required trip information (destination, dates)" },
        { status: 400 }
      )
    }

    const dishNames = selectedDishes?.map((d: { name: string }) => d.name) || []
    const allergyWarning =
      profile?.allergies?.length > 0
        ? `CRITICAL: The user is allergic to ${profile.allergies.join(", ")}. NEVER include dishes with these allergens.`
        : ""

    const numDays = Math.max(
      1,
      Math.min(
        7,
        Math.ceil(
          (new Date(trip.arrivalDate).getTime() -
            new Date(trip.departureDate).getTime()) /
            86400000
        ) + 1
      )
    )

    // Get cultural meal timing information
    const destination = trip.destination as DestinationKey
    const mealCulture = MEAL_CULTURE[destination] || {
      breakfast: "07:00-08:00",
      lunch: "12:00-13:00",
      dinner: "19:00-20:00",
      snack: "15:00",
      culture: "Local meal culture information not available",
      typical_portions: "Standard portions"
    }

    const culturalContext = `
CULTURAL MEAL TIMING FOR ${trip.destination}:
- Breakfast: ${mealCulture.breakfast}
- Lunch: ${mealCulture.lunch}
- Dinner: ${mealCulture.dinner}
- Snack: ${mealCulture.snack}

Cultural Notes: ${mealCulture.culture}
Typical Portions: ${mealCulture.typical_portions}

IMPORTANT: Use these local meal times as the TARGET times for the destination. 
The timezone shift (${trip.timezoneShift || 0} hours) should be used to calculate jet lag adjustment strategy:
- Day 1: Start with home country meal times, shift slightly towards local times
- Day 2-3: Gradually transition to local meal times
- Day 4+: Fully adopt local meal times shown above

This helps the traveler adjust to the new timezone while respecting local dining customs.`

    console.log("Making OpenAI request for", numDays, "days")

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert travel nutrition planner with deep knowledge of international dining customs and jet lag management.

Create a ${numDays}-day meal plan for a trip to ${trip.destination}.

USER PROFILE:
- Daily calorie target: ${profile?.dailyCalorieTarget || 2000} kcal
- Macros: Protein ${profile?.macros?.protein || 150}g, Carbs ${profile?.macros?.carbs || 250}g, Fat ${profile?.macros?.fat || 67}g
- Goal: ${profile?.goal || "maintain"}
- Dietary preferences: ${profile?.dietaryPreferences?.join(", ") || "none"}
${allergyWarning}

SELECTED LOCAL DISHES: ${dishNames.join(", ") || "local specialties"}

${culturalContext}

RESPONSE FORMAT - Return ONLY this JSON structure, no other text:
{
  "plan": {
    "id": "plan-${Date.now()}",
    "tripId": "${trip.id || "trip-1"}",
    "status": "ai-generated",
    "days": [
      {
        "date": "YYYY-MM-DD",
        "adjustedTimezone": <hours adjusted from home timezone>,
        "culturalNotes": "<brief note about local meal customs for this day>",
        "meals": [
          {
            "id": "<unique-id>",
            "type": "breakfast"|"lunch"|"dinner"|"snack",
            "suggestedTime": "HH:MM",
            "localTime": "HH:MM",
            "dish": "<dish name from selected dishes or similar local option>",
            "restaurant": "<optional restaurant type suggestion>",
            "calories": <number>,
            "protein": <grams>,
            "carbs": <grams>,
            "fat": <grams>,
            "allergenSafe": true,
            "notes": "<brief tip about timing, portion, or cultural context>"
          }
        ],
        "dailyTotals": {
          "calories": <sum>,
          "protein": <sum>,
          "carbs": <sum>,
          "fat": <sum>
        }
      }
    ]
  }
}

CRITICAL REQUIREMENTS:
1. Each day must have 3 main meals + 1-2 snacks
2. Suggested times must follow the jet lag adjustment strategy described in cultural context
3. Daily totals should be within ±10% of calorie target
4. Macro distribution should approximate the user's targets
5. NEVER include allergens: ${profile?.allergies?.join(", ") || "none"}
6. Incorporate selected local dishes where appropriate
7. Include cultural notes to help traveler understand local dining customs
8. Restaurant suggestions should match local dining culture (street food, cafes, formal dining, etc.)

Return ONLY the JSON object, nothing else.`,
          },
          {
            role: "user",
            content: `Create my ${numDays}-day meal plan for ${trip.destination}, starting ${trip.departureDate}. I want to experience authentic local cuisine while maintaining my nutrition goals and smoothly adjusting to the local timezone.`,
          },
        ],
        max_tokens: 3000,
        temperature: 0.6,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error("OpenAI API error:", response.status, err)
      return NextResponse.json(
        { error: "OpenAI API request failed", details: `Status ${response.status}` },
        { status: 500 }
      )
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ""
    
    console.log("OpenAI response received, content length:", content.length)

    let parsed
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        console.error("No JSON found in response:", content.substring(0, 200))
        throw new Error("No JSON found in OpenAI response")
      }
      parsed = JSON.parse(jsonMatch[0])
      console.log("Successfully parsed meal plan with", parsed?.plan?.days?.length || 0, "days")
    } catch (parseError) {
      console.error("Failed to parse meal plan JSON:", parseError)
      console.error("Content preview:", content.substring(0, 500))
      return NextResponse.json(
        { error: "Failed to parse meal plan", details: parseError instanceof Error ? parseError.message : "Unknown parse error" },
        { status: 500 }
      )
    }

    // Ensure IDs exist on each meal
    if (parsed?.plan?.days) {
      for (const day of parsed.plan.days) {
        for (const meal of day.meals) {
          if (!meal.id) meal.id = generateId()
        }
      }
      console.log("Meal plan ready, returning response")
    } else {
      console.error("Invalid plan structure:", parsed)
    }

    return NextResponse.json(parsed || { plan: null })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("Meal plan error:", errorMessage, error)
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    )
  }
}
