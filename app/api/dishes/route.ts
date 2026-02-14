import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { destination, allergies, preferences } = await req.json()

    const apiKey =
      req.headers.get("x-openai-key") || process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 401 }
      )
    }

    if (!destination) {
      return NextResponse.json(
        { error: "Destination required" },
        { status: 400 }
      )
    }

    const allergyContext =
      allergies?.length > 0
        ? `CRITICAL SAFETY REQUIREMENT: The user has these allergies: ${allergies.join(", ")}. DO NOT include any dishes OR beverages that contain these allergens. Only suggest options that are completely safe and do not contain any of these ingredients. Still include the "allergens" field, but it should NOT contain any of the user's allergens.`
        : ""

    const prefContext =
      preferences?.length > 0
        ? `The user prefers: ${preferences.join(", ")}. Prioritize dishes that match these preferences when possible.`
        : ""

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
            content: `You are a culinary guide specializing in ${destination} cuisine. Return a JSON object with BOTH "dishes" and "beverages" arrays.

"dishes" must contain 8-12 typical local dishes. Each dish must have:
{
  "name": string,
  "category": "soups" | "main" | "desserts" | "snacks",
  "description": string (20-30 words),
  "estimatedCalories": number,
  "allergens": string[] (common allergens like "Gluten", "Dairy", "Eggs", "Peanuts", "Tree Nuts", "Soy", "Fish", "Shellfish", "Wheat", "Sesame")
}
Include at least 2 soups, 3-4 mains, 2 desserts, and 2 snacks.

"beverages" must contain 6-10 typical local drinks (mix alcoholic and non-alcoholic when culturally relevant). Each beverage must have:
{
  "name": string,
  "type": "alcoholic" | "non-alcoholic",
  "description": string (12-24 words),
  "estimatedCalories": number,
  "allergens": string[],
  "worthTrying": boolean,
  "whyWorthTrying": string (max 16 words)
}

Guidance for beverages:
- Mark "worthTrying" true only for drinks that are authentic, popular, and realistically worth trying for travelers.
- Set "worthTrying" false for generic drinks with low cultural relevance.
- Keep allergen safety rules equally strict for beverages.

${allergyContext}
${prefContext}
Return ONLY the JSON object, no other text.`,
          },
          {
            role: "user",
            content: `List typical local dishes and beverages from ${destination} with nutritional estimates.`,
          },
        ],
        max_tokens: 1500,
        temperature: 0.7,
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
      console.error("Failed to parse dishes JSON:", content)
      return NextResponse.json(
        { error: "Failed to parse dishes" },
        { status: 500 }
      )
    }

    return NextResponse.json(parsed || { dishes: [], beverages: [] })
  } catch (error) {
    console.error("Dishes error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
