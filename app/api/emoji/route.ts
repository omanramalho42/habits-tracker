import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

// app/api/emoji/route.ts

export const EmojiSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  // Alterado para 'imageUrl' para bater com o Prisma e aceitar URLs longas
  imageUrl: z.string().url("URL da imagem inválida"), 
  taskId: z.string().uuid().optional().nullable(),
})

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

      // 🔎 Query params (opcional)
      const { searchParams } = new URL(request.url);
      const taskId = searchParams.get("taskId");

    // 📦 Busca no banco
    const emojis = await prisma.emoji.findMany({
      where: {
        status: "ACTIVE",
        ...(taskId ? { taskId } : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(emojis, { status: 200 });

  } catch (error) {
    console.error("Erro ao buscar emojis:", error);

    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json();
    
    // Log para você ver exatamente o que está chegando e por que o Zod trava
    console.log("Payload recebido na API:", body);

    const validation = EmojiSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        error: "Dados inválidos", 
        details: validation.error.format() 
      }, { status: 400 });
    }

    const { name, imageUrl, taskId } = validation.data;
    console.log(name,imageUrl, taskId)

    const newEmoji = await prisma.emoji.create({
      data: {
        name,
        imageUrl, // Agora os nomes batem
        taskId: taskId || null,
        status: "ACTIVE"
      }
    });

    return NextResponse.json(newEmoji, {
      status: 201
    });

  } catch (error: any) {
    console.error("Erro ao salvar emoji:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}