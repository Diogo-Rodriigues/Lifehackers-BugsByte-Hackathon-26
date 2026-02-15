import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { image, allergies, destination } = await req.json()

    const apiKey =
      req.headers.get("x-openai-key") || process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 401 }
      )
    }

    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      )
    }

    const allergyContext =
      allergies && allergies.length > 0
        ? `The user has the following allergies/intolerances: ${allergies.join(", ")}. ALWAYS flag if any detected ingredients match these allergens.`
        : ""

    const cuisineContext = destination
      ? `The menu is likely from ${destination}. Consider typical local cuisine when analyzing.`
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
            content: `You are a nutritional analysis AI specialized in reading menus. Analyze the menu in the image and extract all individual menu items with their nutritional information. Return a JSON object with this structure:
{
  "items": [
    {
      "name": "Name of the dish",
      "calories": number (estimated kcal),
      "protein": number (grams),
      "carbs": number (grams),
      "fat": number (grams),
      "ingredients": ["list", "of", "typical", "ingredients"],
      "allergenWarnings": ["list of allergens that match user allergies"],
      "confidence": number between 0 and 1
    }
  ]
}
${allergyContext}
${cuisineContext}
Extract ALL visible menu items. If you can't read the menu clearly or if it's not a menu, return an empty items array.
Return ONLY the JSON object, no other text.`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract all menu items from this menu and estimate nutritional content for each.",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${image}`,
                  detail: "high", // Use high detail for menu OCR
                },
              },
            ],
          },
        ],
        max_tokens: 2000, // More tokens for multiple items
        temperature: 0.2, // Lower temperature for more accurate extraction
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

    // Parse JSON from response
    let result
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : { items: [] }
    } catch {
      console.error("Failed to parse menu analysis JSON:", content)
      return NextResponse.json(
        { error: "Failed to parse analysis" },
        { status: 500 }
      )
    }

    if (!result || !Array.isArray(result.items)) {
      return NextResponse.json(
        { error: "Invalid analysis result" },
        { status: 500 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Analyze menu error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
