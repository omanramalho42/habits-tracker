"use client"

import { useState, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { QueryClient, QueryClientProvider, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"
import { 
  X, Send, Loader2, Sparkles 
} from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import AiAssistentPicker from "@/components/v2/ai-assistent-picker"
import { chatSchema, type ChatSchema } from "@/lib/schema/chat"
import { cn } from "@/lib/utils"

interface Message {
  role: "user" | "assistant"
  content: string
}

export default function VoiceAssistant() {
  const [mode, setMode] = useState<"list" | "listening" | "chat">("list")
  const [messages, setMessages] = useState<Message[]>([])
  const [userGoals, setUserGoals] = useState<any[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const [selectedGoal, setSelectedGoal] = useState<any | null>(null)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (!selectedGoal || !selectedAssistantId) return

    chatMutation.mutate({
      assistantId: selectedAssistantId,
      // Garanta que estamos passando o goal.id real aqui
      message: `[SISTEMA]: Objetivo selecionado: "${selectedGoal.name}". ID REAL: ${selectedGoal.id}.`,
      history: messages
    })

    setUserGoals([]) 
  }, [selectedGoal])

  const { register, handleSubmit, watch, control, reset } = useForm<ChatSchema>({
    resolver: zodResolver(chatSchema),
    defaultValues: { message: "", assistantId: "" }
  })

  const selectedAssistantId = watch("assistantId")

  // --- MUTAÇÕES DE DADOS ---

  const fetchGoalsMutation = useMutation({
    mutationFn: async () => {
      const { data } = await axios.get("/api/goals")
      return data
    },
    onSuccess: (data) => {
      setUserGoals(data)
      setMode("chat") 
    }
  })

  const goalMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await axios.post("/api/goals", payload)
      return data
    },
    onSuccess: () => fetchGoalsMutation.mutate()
  })

  const queryClient = useQueryClient()

  const updateGoalMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { id, ...data } = payload
      return axios.patch(`/api/goals/${id}`, data)
    },
    onSuccess: () => {
      // Força o React Query a atualizar a lista real do banco
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      setUserGoals([]) // Limpa os cards da tela de chat
    }
  })

  const deleteGoalMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(`/api/goals/${id}`)
      return response.data
    },
    onSuccess: () => fetchGoalsMutation.mutate()
  })
  const searchGoalsMutation = useMutation({
    mutationFn: async (query: string) => {
      const { data } = await axios.get(`/api/goals?query=${query}`)
      return data
    },
    onSuccess: (data) => {
      setUserGoals(data)
    }
  })
  const chatMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await axios.post("/api/ia/chat", payload)
      return data
    },
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.content }
      ])

      // 🔥 CREATE
      if (data.action?.type === "CREATE_GOAL") {
        goalMutation.mutate(data.action.payload)
      }

      // 🔥 FETCH
      if (data.action?.type === "FETCH_GOALS") {
        fetchGoalsMutation.mutate()
      }

      // 🔥 SEARCH (NOVO)
      if (data.action?.type === "SEARCH_GOALS") {
        searchGoalsMutation.mutate(data.action.query)
      }

      // 🔥 UPDATE
      if (data.action?.type === "UPDATE_GOAL") {
        updateGoalMutation.mutate(data.action.payload)
      }
      if (["UPDATE_GOAL", "DELETE_GOAL", "CREATE_GOAL"].includes(data.action?.type)) {
        setSelectedGoal(null)
        setUserGoals([])
      }
      // 🔥 DELETE
      if (data.action?.type === "DELETE_GOAL") {
        deleteGoalMutation.mutate(data.action.payload.id)
      }
    }
  })

  const onSendMessage = async (data: ChatSchema) => {
    if (!data.message.trim()) return

    const userMessage: Message = { role: "user", content: data.message }
    setMessages((prev) => [...prev, userMessage])
    setMode("chat")
    reset({ ...data, message: "" })

    chatMutation.mutate({
      ...data,
      history: [...messages, userMessage]
    })
  }

  return (
    <div className="relative mx-auto flex min-h-screen max-w-md flex-col bg-[#0a0a0c] text-white">
      <div className="z-50 p-4 border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-md">
        <AiAssistentPicker control={control} name="assistantId" />
      </div>
      <main className="relative flex-1 overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          {mode === "list" && messages.length === 0 ? (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 flex-1 flex flex-col items-center justify-center text-center opacity-40">
              <Sparkles className="size-12 mb-4" />
              <p>Selecione um mentor e comece a evoluir 1% hoje.</p>
            </motion.div>
          ) : (
            <motion.div key="chat" ref={scrollRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 p-4 overflow-y-auto space-y-4 scroll-smooth">
              {messages.map((msg, i) => (
                <div key={i} className="space-y-3">
                  <div className={cn(
                    "max-w-[85%] p-3 rounded-2xl text-sm",
                    msg.role === "user" ? "ml-auto bg-purple-600 shadow-[0_0_15px_rgba(147,51,234,0.3)]" : "mr-auto bg-white/10 border border-white/5"
                  )}>
                    {msg.content}
                  </div>
                  
                  {/* Renderiza Cards de Objetivos se a IA solicitar ou houver dados */}
                  {msg.role === "assistant" && i === messages.length - 1 && userGoals.length > 0 && (
                    <div className="grid grid-cols-1 gap-3 py-2">
                      {userGoals.map((goal) => (
                        <GoalCard 
                          key={goal.id} 
                          goal={goal}
                          isSelected={selectedGoal?.id === goal.id}
                          onClick={() => setSelectedGoal(goal)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              {chatMutation.isPending && (
                <div className="flex items-center gap-2 text-xs text-white/40 bg-white/5 w-fit p-2 rounded-lg">
                  <Loader2 className="size-3 animate-spin text-purple-500" /> 
                  Sincronizando com a rede...
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <div className="p-4 bg-linear-to-t from-[#0a0a0c] to-transparent">
        <form onSubmit={handleSubmit(onSendMessage)} className="flex items-center gap-2">
          <Input
            {...register("message")}
            placeholder="Comande sua evolução..."
            disabled={chatMutation.isPending}
            className="h-12 bg-white/5 border-white/10 rounded-xl focus-visible:ring-purple-500 transition-all"
          />
          <Button type="submit" disabled={chatMutation.isPending || !selectedAssistantId} className="h-12 w-12 rounded-xl bg-purple-600 hover:bg-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.4)]">
            {chatMutation.isPending ? <Loader2 className="animate-spin" /> : <Send className="size-5" />}
          </Button>
        </form>
      </div>
    </div>
  )
}

const GoalCard = ({ goal, isSelected, onClick }: any) => (
  <motion.div
    onClick={onClick}
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className={cn(
      "w-full p-4 rounded-2xl border transition-all group cursor-pointer",
      isSelected
        ? "bg-purple-600/20 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)]"
        : "bg-white/5 border-white/10 hover:border-purple-500/50"
    )}
  >
    <div className="flex items-center gap-3">
      <div className="size-10 rounded-xl bg-purple-600/20 flex items-center justify-center text-xl">
        {goal.emoji || "🎯"}
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-white">{goal.name}</h4>
        <p className="text-xs text-white/40">{goal.description}</p>
      </div>
    </div>
  </motion.div>
)