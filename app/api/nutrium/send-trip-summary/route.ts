import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const tripId = String(body?.tripId || "")
    const analysis = body?.analysis

    if (!tripId || !analysis) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Simulated provider roundtrip.
    await new Promise((resolve) => setTimeout(resolve, 1700))

    if (body?.forceFail === true) {
      return NextResponse.json(
        { ok: false, error: "Simulated provider error" },
        { status: 503 }
      )
    }

    const syncId = `nutrium-sim-${Date.now()}`
    return NextResponse.json({
      ok: true,
      syncId,
      message: "Dados enviados com sucesso para revisão",
      reviewStatus: "queued",
    })
  } catch {
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
