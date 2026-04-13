import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: Request) {
  const { message, assistantId, history } = await req.json()

  const assistant = await prisma.assistant.findUnique({
    where: { id: assistantId },
  })

  if (!assistant) return NextResponse.json({ error: "Assistant not found" }, { status: 404 })

  const tools: OpenAI.Chat.ChatCompletionTool[] = [
    {
      type: "function",
      function: {
        name: "create_goal",
        description: "Cria um novo objetivo baseado no desejo do usuário.",
        parameters: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            emoji: { type: "string" },
          },
          required: ["name"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "search_goals",
        description: "Busca e exibe objetivos. Se houver 'query', filtra por nome/descrição. Se 'query' for vazio ou 'all', retorna a lista completa.",
        parameters: {
          type: "object",
          properties: { 
            query: { type: "string", description: "Termo de busca ou 'all' para lista completa." } 
          },
          required: ["query"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "update_goal",
        description: "Atualiza um objetivo específico usando o ID técnico.",
        parameters: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            description: { type: "string" },
            emoji: { type: "string" }
          },
          required: ["id"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "delete_goal",
        description: "Remove um objetivo do sistema.",
        parameters: {
          type: "object",
          properties: { id: { type: "string" } },
          required: ["id"]
        }
      }
    }
  ]

  const systemContent = `
    ${assistant.prompt}

    SISTEMA DE GESTÃO DE OBJETIVOS (CRÍTICO):
    
    1. LISTAGEM/BUSCA (search_goals): 
      - Sempre que listar, instrua: "Se desejar, clique em um card para facilitar a edição ou remoção."

    2. SELEÇÃO DE CARD (Foco):
      - Ao receber "[SISTEMA]: Usuário focou...", NÃO atualize nada.
      - Responda confirmando o foco: "Alvo '[NOME]' selecionado. O que deseja fazer? Posso atualizar os detalhes, mostrar progresso ou remover este registro."

    3. FLUXO DE EDIÇÃO (update_goal):
      - Se o usuário pedir para editar mas for vago (ex: "mude isso"), pergunte: "O que especificamente deseja alterar? (Nome, Descrição ou Emoji?)"
      - Só execute 'update_goal' quando tiver o valor novo E o ID técnico.
      - Se houver múltiplos objetivos parecidos na busca, peça para o usuário clicar no correto antes de prosseguir.

    4. REGRAS DE SEGURANÇA:
      - ID técnico é obrigatório para Update/Delete. Nunca chute o ID.
      - Use tom cyberpunk, curto e direto.
  `;
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemContent },
      ...history,
      { role: "user", content: message }
    ],
    tools,
    tool_choice: "auto",
  })

  const messageResponse = response.choices[0].message

  if (messageResponse.tool_calls && messageResponse.tool_calls.length > 0) {
    const toolCall = messageResponse.tool_calls[0]

    if (toolCall.type === 'function') {
      const functionCall = toolCall as any 
      const functionName = functionCall.function.name
      const args = JSON.parse(functionCall.function.arguments)

      if (functionName === 'create_goal') {
        return NextResponse.json({
          role: "assistant",
          content: messageResponse.content || `Objetivo "${args.name}" ${args.emoji || '🎯'} integrado ao sistema.`,
          action: { type: "CREATE_GOAL", payload: args }
        })
      }

      if (functionName === "search_goals") {
        // Verifique se args.query existe, se não, use "all"
        const searchQuery = args.query || 'all';
        return NextResponse.json({
          role: "assistant",
          content: searchQuery === 'all' ? "Localizei esses registros na sua linha de evolução. Qual deles vamos ajustar?" : `Filtrei os objetivos sobre "${searchQuery}".`,
          action: { type: "SEARCH_GOALS", query: searchQuery } // Garante que a query vá para a mutação
        })
      }

      if (functionName === "update_goal") {
        return NextResponse.json({
          role: "assistant",
          content: "Protocolo de atualização concluído. Dados sincronizados. ⚡",
          action: { type: "UPDATE_GOAL", payload: args }
        })
      }

      if (functionName === "delete_goal") {
        return NextResponse.json({
          role: "assistant",
          content: "Alvo removido. Menos ruído, mais foco.",
          action: { type: "DELETE_GOAL", payload: args }
        })
      }
    }
  }

  return NextResponse.json({
    content: messageResponse.content,
    role: "assistant"
  })
}