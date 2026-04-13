import { NextRequest, NextResponse } from "next/server"
import { openai } from "@/lib/openai"
import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { voiceSchemas } from "@/lib/schema/ia"
import { ElevenLabsClient } from "elevenlabs"

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

export async function GET() {
  try {
    const response = await elevenlabs.voices.getAll();
    
    // Mapeamos para o formato que seu front espera
    const voices = response.voices.map(voice => ({
      id: voice.voice_id,
      name: voice.name,
      provider: "elevenlabs",
      previewUrl: voice.preview_url, // URL nativa do ElevenLabs
      description: voice.labels?.accent || "Voz profissional",
    }));

    return NextResponse.json(voices);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao buscar vozes" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      include: { usage: true }
    });

    if (!user || !user.usage) {
      return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });
    }
    if (!user.usage.canUseVoice && user.role !== "ADMIN") {
      return NextResponse.json({ error: "VOICE_ACCESS_DENIED" }, { status: 403 });
    }
    // Mantendo sua trava de segurança por Role
    if (user.role === "USER") {
      return NextResponse.json({ error: "PREMIUM_REQUIRED" }, { status: 403 });
    }

    // Verificação de Limite
    if (user.usage.aiGenerationsUsed >= user.usage.aiLimit) {
      return NextResponse.json({ error: "LIMIT_REACHED" }, { status: 429 });
    }

    const { transcript } = await request.json();

    // 4. Chamada OpenAI configurada para roteamento de intenção
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: `Você é o assistente de voz do app Lab Habit. 
          Sua tarefa é extrair a intenção (action) e um título simplificado do texto do usuário.
          
          Ações permitidas:
          - "habit": se o usuário quer criar ou falar sobre um hábito.
          - "task": se for sobre uma tarefa simples ou afazer.
          - "routine": se for sobre rotina ou automatização.
          - "goal": se for sobre uma meta de longo prazo.
          - "category": se for sobre organizar categorias.
          
          Responda estritamente em JSON no formato:
          { "action": "string", "title": "string" }
          
          Exemplo: "Quero criar um hábito de beber água" -> { "action": "habit", "title": "Beber Água" }`
        },
        { role: "user", content: transcript }
      ],
      response_format: { type: "json_object" }, // Garante o retorno em JSON
      temperature: 0.3, // Menor temperatura para ser mais preciso na classificação
    });

    const content = aiResponse.choices[0].message.content || "{}"
    const aiData = JSON.parse(content)

    // Validação com Zod
    const action = aiData.action as keyof typeof voiceSchemas
    const schema = voiceSchemas[action]

    if (schema) {
      const result = schema.safeParse(aiData)

      if (!result.success) {
        // Identifica o primeiro campo faltante ou inválido
        const missingField = result.error.errors[0].path[0]
        const errorMessage = result.error.errors[0].message

        return NextResponse.json({
          status: "INCOMPLETE",
          action: action,
          missingField: missingField,
          message: `Identifiquei que você quer criar um ${action}, mas: ${errorMessage}. Qual o valor desse campo?`,
          currentData: aiData // Devolvemos o que a IA já pegou
        })
      }
    }

    return NextResponse.json({
      status: "SUCCESS",
      data: aiData
    })
  } catch (error: any) {
    console.error("Voice Route Error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}