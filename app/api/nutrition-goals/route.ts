import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    try {
        const { sex, age, height, weight } = await req.json()

        const apiKey =
            req.headers.get("x-openai-key") || process.env.OPENAI_API_KEY
        if (!apiKey) {
            // Fallback to Mifflin-St Jeor calculation
            return NextResponse.json(calculateFallback(sex, age, height, weight))
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
                        content: `You are a nutrition expert. Given a person's physical data, calculate their recommended daily nutrition targets.

Return ONLY this JSON, no other text:
{
  "dailyCalorieTarget": <number, kcal>,
  "macros": {
    "protein": <number, grams>,
    "carbs": <number, grams>,
    "fat": <number, grams>
  },
  "waterTarget": <number, ml>
}

Use evidence-based formulas (Mifflin-St Jeor for BMR, moderate activity multiplier of 1.55).
Round all values to integers.
Water target should be based on weight (approximately 35ml per kg of body weight).
Macro split: ~30% protein, ~45% carbs, ~25% fat by calories.`,
                    },
                    {
                        role: "user",
                        content: `Calculate nutrition targets for:
- Sex: ${sex}
- Age: ${age} years
- Height: ${height} cm
- Weight: ${weight} kg`,
                    },
                ],
                max_tokens: 300,
                temperature: 0.3,
            }),
        })

        if (!response.ok) {
            console.error("OpenAI API error for nutrition goals:", response.status)
            return NextResponse.json(calculateFallback(sex, age, height, weight))
        }

        const data = await response.json()
        const content = data.choices?.[0]?.message?.content || ""

        try {
            const jsonMatch = content.match(/\{[\s\S]*\}/)
            if (!jsonMatch) throw new Error("No JSON in response")
            const parsed = JSON.parse(jsonMatch[0])
            return NextResponse.json({
                dailyCalorieTarget: parsed.dailyCalorieTarget,
                macros: parsed.macros,
                waterTarget: parsed.waterTarget,
            })
        } catch {
            console.error("Failed to parse nutrition goals response")
            return NextResponse.json(calculateFallback(sex, age, height, weight))
        }
    } catch (error) {
        console.error("Nutrition goals error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

function calculateFallback(
    sex: string,
    age: number,
    height: number,
    weight: number
) {
    // Mifflin-St Jeor equation
    let bmr: number
    if (sex === "female") {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161
    } else {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5
    }

    // Moderate activity multiplier
    const tdee = Math.round(bmr * 1.55)
    const protein = Math.round((tdee * 0.3) / 4)
    const fat = Math.round((tdee * 0.25) / 9)
    const carbs = Math.round((tdee - protein * 4 - fat * 9) / 4)
    const waterTarget = Math.round(weight * 35)

    return {
        dailyCalorieTarget: tdee,
        macros: { protein, carbs, fat },
        waterTarget,
    }
}
