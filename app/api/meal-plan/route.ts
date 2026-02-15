import { NextRequest, NextResponse } from "next/server"

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export async function POST(req: NextRequest) {
  try {
    const { trip, profile, selectedDishes } = await req.json()

    console.log("Meal plan request received:", {
      destination: trip?.destination,
      departureCity: trip?.departureCity,
      arrivalDate: trip?.arrivalDate,
      returnDate: trip?.returnDate,
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

    if (!trip?.destination || !trip?.arrivalDate || !trip?.returnDate) {
      console.error("Missing required trip fields:", { trip })
      return NextResponse.json(
        { error: "Missing required trip information (destination, dates)" },
        { status: 400 }
      )
    }

    const dishNames = selectedDishes?.map((d: { name: string }) => d.name) || []

    const allergyList = (profile?.allergies || []).filter((a: string) => a !== "Not Know")
    const allergyWarning =
      allergyList.length > 0
        ? `⚠️ CRITICAL SAFETY REQUIREMENT — DIETARY RESTRICTIONS ⚠️
The user has the following allergies/intolerances: ${allergyList.join(", ")}.
- You MUST NEVER include ANY dish, snack, beverage, or ingredient that contains these allergens.
- Every single meal MUST have "allergenSafe": true — if you cannot guarantee safety, DO NOT include that dish.
- This is a HEALTH AND SAFETY constraint. Violating it could cause serious harm.
- Double-check every dish suggestion against the allergen list before including it.`
        : ""

    const dietaryPrefWarning =
      (profile?.dietaryPreferences || []).filter((p: string) => p !== "No Preference").length > 0
        ? `DIETARY PREFERENCES (must be respected):
The user follows these dietary preferences: ${profile.dietaryPreferences.filter((p: string) => p !== "No Preference").join(", ")}.
All meal suggestions MUST comply with these dietary restrictions. For example, if the user is Vegan, NEVER suggest any animal products.`
        : ""

    const numDays = Math.max(
      1,
      Math.min(
        7,
        Math.ceil(
          (new Date(trip.returnDate).getTime() -
            new Date(trip.arrivalDate).getTime()) /
          86400000
        ) + 1
      )
    )

    const departureCity = trip.departureCity || "Unknown origin"

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
            content: `You are an expert travel nutrition planner, chronobiologist, and cultural food specialist. You have deep knowledge of international dining customs, timezone adaptation, jetlag management through meal timing, and caffeine chronotherapy.

TASK: Create a comprehensive ${numDays}-day meal plan for a traveler going from "${departureCity}" to "${trip.destination}".
The traveler ARRIVES at ${trip.destination} on ${trip.arrivalDate}${trip.arrivalTime ? ` at ${trip.arrivalTime} local time` : ''}.
The traveler DEPARTS from ${trip.destination} on ${trip.returnDate}${trip.returnTime ? ` at ${trip.returnTime} local time` : ''}.

═══════════════════════════════════════════
STEP 1: TIMEZONE ANALYSIS (you must calculate this)
═══════════════════════════════════════════
- Determine the standard UTC offset of "${departureCity}" (the departure city/country)
- Determine the standard UTC offset of "${trip.destination}" (the destination country)
- Calculate the timezone difference in hours between departure and destination
- Use this difference to build the jetlag adjustment strategy below

═══════════════════════════════════════════
STEP 2: CULTURAL MEAL TIMING RESEARCH
═══════════════════════════════════════════
Based on your knowledge of ${trip.destination}'s dining culture:
- Determine the typical local times for breakfast, lunch, dinner, and snacks
- Note cultural dining customs (e.g., late dinners in Spain, early dinners in Japan, large lunches in Mexico)
- Note typical portion sizes and dining style (street food, multiple courses, shared platters, etc.)

═══════════════════════════════════════════
STEP 3: JETLAG-AWARE MEAL SCHEDULING
═══════════════════════════════════════════
The "suggestedTime" for each meal MUST be calculated by combining:
1. The LOCAL cultural meal times of ${trip.destination} (from Step 2)
2. A gradual jetlag adjustment strategy based on the timezone difference (from Step 1)

Strategy:
- Day 1: Meals at times close to the traveler's home timezone habits, shifted ~25% toward local times
- Day 2: Shifted ~50% toward local cultural meal times
- Day 3: Shifted ~75% toward local times  
- Day 4+: Fully aligned with local cultural meal times

The goal is to use meal timing as a circadian rhythm anchor to minimize jetlag.

═══════════════════════════════════════════
IMPORTANT: PARTIAL-DAY AWARENESS
═══════════════════════════════════════════
- On the FIRST day (arrival day, ${trip.arrivalDate}): The traveler arrives at ${trip.arrivalTime || 'unknown time'}.
  Only include meals that happen AFTER the arrival time. For example, if arriving at 20:00, only include dinner and/or a snack — NOT breakfast or lunch.
- On the LAST day (departure day, ${trip.returnDate}): The traveler departs at ${trip.returnTime || 'unknown time'}.
  Only include meals that happen BEFORE the departure time. For example, if departing at 10:00, only include breakfast — NOT lunch or dinner.
- Middle days should have full meals (breakfast, lunch, dinner + snacks).

═══════════════════════════════════════════
STEP 4: CAFFEINE SCHEDULE FOR JETLAG
═══════════════════════════════════════════
Generate a caffeine intake schedule that helps the traveler adapt:
- Recommend specific times for coffee/tea consumption on each day
- Include a caffeine cutoff time (typically 8+ hours before desired bedtime in destination timezone)
- On early days, caffeine can help with alertness during the adjustment period
- Avoid caffeine too late as it disrupts sleep adaptation
- Consider the local coffee/tea culture of ${trip.destination}

═══════════════════════════════════════════
USER PROFILE
═══════════════════════════════════════════
- Name: ${profile?.name || "Traveler"}
- Sex: ${profile?.sex || "not specified"}, Age: ${profile?.age || "not specified"}
- Height: ${profile?.height || "not specified"} cm, Weight: ${profile?.weight || "not specified"} kg
- Daily calorie target: ${profile?.dailyCalorieTarget || 2000} kcal
- Macros: Protein ${profile?.macros?.protein || 150}g, Carbs ${profile?.macros?.carbs || 250}g, Fat ${profile?.macros?.fat || 67}g
- Goal: ${profile?.goal || "maintain"}

${allergyWarning}

${dietaryPrefWarning}

═══════════════════════════════════════════
SELECTED LOCAL DISHES TO INCORPORATE
═══════════════════════════════════════════
${dishNames.length > 0 ? dishNames.join(", ") : "No specific dishes selected — suggest authentic local specialties"}

═══════════════════════════════════════════
RESPONSE FORMAT — Return ONLY this JSON, no other text:
═══════════════════════════════════════════
{
  "plan": {
    "id": "plan-${Date.now()}",
    "tripId": "${trip.id || "trip-1"}",
    "status": "ai-generated",
    "caffeineSchedule": [
      {
        "time": "HH:MM",
        "recommendation": "<what to drink, e.g. 'Espresso', 'Green tea', 'No caffeine'>",
        "reason": "<why this timing helps with jetlag adaptation>"
      }
    ],
    "days": [
      {
        "date": "YYYY-MM-DD",
        "adjustedTimezone": <hours of timezone difference between origin and destination>,
        "culturalNotes": "<brief cultural dining tip for this day, mentioning local customs>",
        "meals": [
          {
            "id": "<unique-id>",
            "type": "breakfast"|"lunch"|"dinner"|"snack",
            "suggestedTime": "HH:MM",
            "dish": "<dish name — from selected dishes list or authentic local option>",
            "calories": <number>,
            "protein": <grams>,
            "carbs": <grams>,
            "fat": <grams>,
            "allergenSafe": true,
            "notes": "<brief tip: why this time, how it helps with jetlag, cultural context, or portion advice>"
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

═══════════════════════════════════════════
CRITICAL REQUIREMENTS (MUST ALL BE MET)
═══════════════════════════════════════════
1. Each day MUST have exactly 3 main meals (breakfast, lunch, dinner) + 1-2 snacks
2. "suggestedTime" MUST reflect the jetlag-adjusted + culturally-aware timing (NOT just generic times)
3. Daily calorie totals MUST be within ±10% of the ${profile?.dailyCalorieTarget || 2000} kcal target
4. Macro distribution MUST approximate: P${profile?.macros?.protein || 150}g / C${profile?.macros?.carbs || 250}g / F${profile?.macros?.fat || 67}g
5. ${allergyList.length > 0 ? `ABSOLUTELY NEVER include any dish containing: ${allergyList.join(", ")}. This is non-negotiable.` : "No specific allergens to avoid."}
6. ${(profile?.dietaryPreferences || []).filter((p: string) => p !== "No Preference").length > 0 ? `ALL meals must comply with: ${profile.dietaryPreferences.filter((p: string) => p !== "No Preference").join(", ")}` : "No specific dietary preference restrictions."}
7. Incorporate the user's selected local dishes where nutritionally appropriate
8. The "notes" field for each meal should explain the timing choice (jetlag context)
9. caffeineSchedule must have 3-5 entries covering the general daily caffeine strategy
10. "allergenSafe" must ALWAYS be true — never suggest unsafe food

Return ONLY the JSON object. No markdown, no explanation, no wrapping.`,
          },
          {
            role: "user",
            content: `Create my ${numDays}-day meal plan. I'm traveling from "${departureCity}" to "${trip.destination}". I arrive at ${trip.destination} on ${trip.arrivalDate}${trip.arrivalTime ? ` at ${trip.arrivalTime}` : ""} and depart on ${trip.returnDate}${trip.returnTime ? ` at ${trip.returnTime}` : ""}. I want authentic local cuisine, smooth jetlag adjustment through strategic meal timing, and a caffeine schedule to help me adapt. IMPORTANT: On my arrival day, only plan meals AFTER my arrival time. On my departure day, only plan meals BEFORE my departure time. My nutrition goals and dietary restrictions must be strictly followed.`,
          },
        ],
        max_tokens: 4000,
        temperature: 0.5,
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

