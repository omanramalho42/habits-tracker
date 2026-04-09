import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { prisma } from "@/lib/prisma"; // ajuste o caminho se necessário
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    // 1. Buscar usuário e seu uso atual
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      include: { usage: true }
    });

    if (!user || !user.usage) {
      return NextResponse.json({ error: "Perfil de uso não encontrado" }, { status: 404 });
    }

    // 2. Bloqueio por Role (Apenas STARTER, PREMIUM e ADMIN podem usar)
    // Se for apenas USER, bloqueamos.
    if (user.role === "USER") {
      return NextResponse.json({ error: "PREMIUM_REQUIRED" }, { status: 403 });
    }

    // 3. Verificação de Limite Quantiativo
    if (user.usage.aiGenerationsUsed >= user.usage.aiLimit) {
      return NextResponse.json({ error: "LIMIT_REACHED" }, { status: 429 });
    }

    const body = await request.json();
    const { messages } = body;

    // 4. Chamada OpenAI
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: messages,
      temperature: 0.8,
      max_tokens: 100,
    });

    const aiMessage = aiResponse.choices[0].message;

    // 5. Incrementar o uso no Banco de Dados
    await prisma.userUsage.update({
      where: { userId: user.id },
      data: { aiGenerationsUsed: { increment: 1 } }
    });

    return NextResponse.json(aiMessage);

  } catch (error: any) {
    console.error("AI Route Error:", error);
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 });
  }
}