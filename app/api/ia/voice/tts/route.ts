import { ElevenLabsClient } from "elevenlabs";
import { NextResponse } from "next/server";

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { voiceId, text } = await req.json();

    if (!voiceId || !text) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    // O método convert retorna um stream que precisamos consumir
    const audioStream = await elevenlabs.textToSpeech.convert(voiceId, {
      text: text,
      model_id: "eleven_multilingual_v2",
      output_format: "mp3_44100_128",
    });

    // Transformando o stream em buffer para a resposta da Next API
    const chunks: Buffer[] = [];
    for await (const chunk of audioStream) {
      chunks.push(Buffer.from(chunk));
    }
    const content = Buffer.concat(chunks);

    return new NextResponse(content, {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (error: any) {
    console.error("Erro no SDK ElevenLabs:", error);
    return NextResponse.json({ error: "Falha na síntese de voz" }, { status: 500 });
  }
}