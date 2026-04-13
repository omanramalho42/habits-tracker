import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const userDb = await prisma.user.findFirst({
      where: {
        clerkUserId: userId
      }
    })
    
    if (!userDb) {
      return NextResponse.json({
        error: "user not found"
      }, { status: 401 })
    }
    const body = await request.json();
    
    // const parsedBody = CreateCategorieSchema.safeParse(body)
  
    // if (!parsedBody.success) {
    //   throw new Error(parsedBody.error.message)
    // }
    
    const { 
      name, 
      emojiId, 
      prompt, 
      voiceId, 
      temperature, 
      creativity, 
      memoryEnabled 
    } = body;

    // --- DEBUG STEP 1: Recebimento ---
    console.log("🚀 [CREATE_ASSISTANT] Payload recebido:", body);

    if (!name || !emojiId) {
      return new NextResponse("Nome e Emoji são obrigatórios", { status: 400 });
    }

    // --- DEBUG STEP 2: Refinamento do Prompt ---
    // Aqui você pode injetar instruções de sistema padrões antes de salvar
    const baseSystemInstructions = `
      Você é um assistente personalizado chamado ${name}.
      Sua personalidade é definida por: ${prompt || "Um mentor prestativo"}.
      Nível de criatividade: ${creativity} (0 a 1).
      Instrução: Seja direto, use um tom motivador e foque em consistência de hábitos.
    `;

    console.log("📝 [CREATE_ASSISTANT] Prompt Final do Sistema:", baseSystemInstructions);

    // --- DEBUG STEP 3: Persistência no Banco ---
    // Assumindo que você tem um model "Assistant" no seu schema.prisma
    const assistant = await prisma.assistant.create({
      data: {
        userId: userDb.id, // 👈 ALTERADO: Use o ID do banco, não o do Clerk
        name,
        emojiId,
        prompt: baseSystemInstructions,
        voiceId: voiceId || null,
        temperature: Number(temperature) || 0.7,
        creativity: Number(creativity) || 0.5,
        memoryEnabled: !!memoryEnabled,
      }
    });

    console.log("✅ [CREATE_ASSISTANT] Assistant criado com sucesso:", assistant.id);

    return NextResponse.json(assistant);
  } catch (error) {
    console.error("❌ [CREATE_ASSISTANT_ERROR]:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}