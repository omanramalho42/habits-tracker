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
    },
    {
      type: "function",
      function: {
        name: "manage_task",
        description: "Gerencia o ciclo de vida das tarefas (criar, atualizar, buscar ou deletar).",
        parameters: {
          type: "object",
          properties: {
            action: { 
              type: "string", 
              enum: ["create", "update", "search", "delete"],
              description: "A operação a ser realizada."
            },
            id: { type: "string", description: "ID da task (obrigatório para update/delete)." },
            name: { type: "string", description: "Nome da tarefa." },
            description: { type: "string", description: "Detalhes da execução." },
            emoji: { type: "string" },
            limitCounter: { type: "number", description: "Meta numérica (ex: total de repetições)." },
            goalId: { type: "string", description: "ID do Objetivo para vincular esta tarefa." },
            query: { type: "string", description: "Termo de busca para listar tarefas." }
          },
          required: ["action"]
        }
      }
    }
  ]

  const systemContent = `
    ${assistant.prompt}
    
    PROTOCOLO DE EXIBIÇÃO DE LISTAS (OBRIGATÓRIO):
    1. Sempre que o usuário solicitar ver objetivos, listar metas ou precisar escolher um objetivo para vincular a uma tarefa, você DEVE obrigatoriamente chamar a função 'search_goals'.
    2. Sempre que o usuário solicitar ver tarefas ou ações de execução, você DEVE obrigatoriamente chamar a função 'manage_task' com action='search'.
    3. NÃO responda apenas com texto se houver uma necessidade de seleção visual. A chamada de função é o que renderiza os cards no sistema do usuário.

    SISTEMA DE GESTÃO INTEGRADA:
    - AO CRIAR TAREFA: Antes de finalizar a criação, se não houver um goalId, execute 'search_goals' para que o usuário selecione o objetivo pai nos cards exibidos.
    - SELEÇÃO ([SISTEMA]: ... focou): Confirme o alvo e aguarde o próximo comando de edição ou exclusão.
    
    Estilo: Cyberpunk, direto, minimalista.
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

      // --- LÓGICA DE TASKS ---
      if (functionName === "manage_task") {
        const { action, ...payload } = args;
        const actionType = action.toUpperCase();

        let customMessage = "";
        switch(action) {
          case "create": customMessage = `Tarefa "${args.name}" inicializada no buffer.`; break;
          case "search": customMessage = "Escaneando banco de dados por tarefas ativas..."; break;
          case "update": customMessage = "Parâmetros de execução atualizados."; break;
          case "delete": customMessage = "Registro de tarefa deletado da rede."; break;
        }

        return NextResponse.json({
          role: "assistant",
          content: messageResponse.content || customMessage,
          action: { 
            type: `${actionType}_TASK`, 
            query: args.query || "all", // Importante para o SEARCH_TASK
            payload: { ...payload, goals: payload.goalId } 
          }
        });
      }

      // --- LÓGICA DE GOALS ---
      if (functionName === "search_goals") {
        const searchQuery = args.query || 'all';
        return NextResponse.json({
          role: "assistant",
          content: messageResponse.content || (searchQuery === 'all' ? "Exibindo todos os seus objetivos ativos." : `Filtrando objetivos para: ${searchQuery}`),
          action: { type: "SEARCH_GOALS", query: searchQuery }
        })
      }

      if (functionName === 'create_goal') {
        return NextResponse.json({
          role: "assistant",
          content: messageResponse.content || `Objetivo "${args.name}" integrado.`,
          action: { type: "CREATE_GOAL", payload: args }
        })
      }

      if (functionName === "update_goal") {
        return NextResponse.json({
          role: "assistant",
          content: messageResponse.content || "Dados do objetivo sincronizados. ⚡",
          action: { type: "UPDATE_GOAL", payload: args }
        })
      }

      if (functionName === "delete_goal") {
        return NextResponse.json({
          role: "assistant",
          content: messageResponse.content || "Alvo removido da linha do tempo.",
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

