import { NextRequest, NextResponse } from "next/server"

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export async function POST(req: NextRequest) {
  try {
    const { profile, todayMeals, remainingMealTypes } = await req.json()

    const apiKey =
      req.headers.get("x-openai-key") || process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 401 }
      )
    }

    const consumed = todayMeals?.reduce(
      (acc: { calories: number; protein: number; carbs: number; fat: number }, m: { calories: number; protein: number; carbs: number; fat: number }) => ({
        calories: acc.calories + m.calories,
        protein: acc.protein + m.protein,
        carbs: acc.carbs + m.carbs,
        fat: acc.fat + m.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    ) || { calories: 0, protein: 0, carbs: 0, fat: 0 }

    const remaining = {
      calories: Math.max(0, (profile?.dailyCalorieTarget || 2000) - consumed.calories),
      protein: Math.max(0, (profile?.macros?.protein || 150) - consumed.protein),
      carbs: Math.max(0, (profile?.macros?.carbs || 250) - consumed.carbs),
      fat: Math.max(0, (profile?.macros?.fat || 67) - consumed.fat),
    }

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
            content: `You are a nutrition advisor. The user has already consumed today:
- Calories: ${consumed.calories}/${profile?.dailyCalorieTarget || 2000} kcal
- Protein: ${consumed.protein}/${profile?.macros?.protein || 150}g
- Carbs: ${consumed.carbs}/${profile?.macros?.carbs || 250}g
- Fat: ${consumed.fat}/${profile?.macros?.fat || 67}g

They need to fit the following remaining macros into their next meals: ${JSON.stringify(remaining)}
Remaining meals to plan: ${(remainingMealTypes || ["dinner"]).join(", ")}
${profile?.allergies?.length > 0 ? `CRITICAL: Allergies: ${profile.allergies.join(", ")}. NEVER suggest foods with these.` : ""}

Return a JSON object:
{
  "adjustments": [
    {
      "id": "unique",
      "type": "lunch"|"dinner"|"snack",
      "dish": "suggested dish",
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number,
      "notes": "why this adjustment"
    }
  ],
  "advice": "brief nutritional advice for the rest of the day"
}
Return ONLY JSON.`,
          },
          {
            role: "user",
            content: "Suggest adjusted meals for the rest of my day.",
          },
        ],
        max_tokens: 800,
        temperature: 0.5,
      }),
    })

    if (!response.ok) {
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
      return NextResponse.json(
        { error: "Failed to parse adjustments" },
        { status: 500 }
      )
    }

    // Ensure IDs
    if (parsed?.adjustments) {
      for (const adj of parsed.adjustments) {
        if (!adj.id) adj.id = generateId()
      }
    }

    return NextResponse.json(parsed || { adjustments: [], advice: "" })
  } catch (error) {
    console.error("Adapt plan error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
