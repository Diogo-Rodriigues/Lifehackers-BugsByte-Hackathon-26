import { NextRequest, NextResponse } from "next/server"

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export async function POST(req: NextRequest) {
  try {
    const { trip, profile, selectedDishes } = await req.json()

    const apiKey =
      req.headers.get("x-openai-key") || process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 401 }
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
            content: `You are a travel nutrition planner. Create a ${numDays}-day meal plan for a trip to ${trip.destination}.
            
User profile:
- Daily calorie target: ${profile?.dailyCalorieTarget || 2000} kcal
- Macros: P ${profile?.macros?.protein || 150}g, C ${profile?.macros?.carbs || 250}g, F ${profile?.macros?.fat || 67}g
- Goal: ${profile?.goal || "maintain"}
- Dietary preferences: ${profile?.dietaryPreferences?.join(", ") || "none"}
${allergyWarning}

Selected local dishes to incorporate: ${dishNames.join(", ") || "local specialties"}
Timezone shift: ${trip.timezoneShift || 0} hours (adjust meal times for jet lag)

Return a JSON object:
{
  "plan": {
    "id": "plan-1",
    "tripId": "${trip.id || "trip-1"}",
    "status": "ai-generated",
    "days": [
      {
        "date": "YYYY-MM-DD",
        "adjustedTimezone": number,
        "meals": [
          {
            "id": "unique-id",
            "type": "breakfast"|"lunch"|"dinner"|"snack",
            "suggestedTime": "HH:MM",
            "dish": "dish name",
            "calories": number,
            "protein": number,
            "carbs": number,
            "fat": number,
            "notes": "brief note"
          }
        ]
      }
    ]
  }
}

Each day should have 3 meals + 1 snack. Suggested times should gradually shift to match destination timezone.
Return ONLY the JSON object, no other text.`,
          },
          {
            role: "user",
            content: `Create a ${numDays}-day meal plan for my trip to ${trip.destination} starting ${trip.departureDate}.`,
          },
        ],
        max_tokens: 3000,
        temperature: 0.6,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error("OpenAI API error:", err)
      return NextResponse.json(
        { error: "OpenAI API request failed" },
        { status: 500 }
      )
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ""

    let parsed
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null
    } catch {
      console.error("Failed to parse meal plan JSON:", content)
      return NextResponse.json(
        { error: "Failed to parse meal plan" },
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
    }

    return NextResponse.json(parsed || { plan: null })
  } catch (error) {
    console.error("Meal plan error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
