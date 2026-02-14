import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { image, allergies } = await req.json()

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
            content: `You are a nutritional analysis AI. Analyze the food in the image and return a JSON object with these exact fields:
{
  "name": "Name of the dish",
  "calories": number (estimated total kcal),
  "protein": number (grams),
  "carbs": number (grams),
  "fat": number (grams),
  "ingredients": ["list", "of", "detected", "ingredients"],
  "allergenWarnings": ["list of allergens present that match user allergies"],
  "confidence": number between 0 and 1
}
${allergyContext}
Return ONLY the JSON object, no other text.`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this meal photo and estimate its nutritional content.",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${image}`,
                  detail: "low",
                },
              },
            ],
          },
        ],
        max_tokens: 500,
        temperature: 0.3,
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
    let analysis
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : null
    } catch {
      console.error("Failed to parse analysis JSON:", content)
      return NextResponse.json(
        { error: "Failed to parse analysis" },
        { status: 500 }
      )
    }

    if (!analysis) {
      return NextResponse.json(
        { error: "No analysis result" },
        { status: 500 }
      )
    }

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error("Analyze meal error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
