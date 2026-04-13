import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { description, gender, age, accent_strength } = await req.json()

    const response = await fetch(
      "https://api.elevenlabs.io/v1/voice-generation/generate-voice",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": process.env.ELEVENLABS_API_KEY!,
        },
        body: JSON.stringify({
          voice_description: description,
          gender,
          age,
          accent_strength: accent_strength ?? 1.0,
          text: "Olá! Eu sou sua nova voz.",
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error)
    }

    const voiceId = response.headers.get("generated_voice_id")
    const buffer = await response.arrayBuffer()

    const base64 = Buffer.from(buffer).toString("base64")

    return NextResponse.json({
      id: voiceId,
      previewAudio: `data:audio/mpeg;base64,${base64}`,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Erro ao gerar voz" }, { status: 500 })
  }
}