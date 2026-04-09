"use client"

import {
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query"

import axios from "axios"
import { toast } from "sonner"

import { fetchUserSettings } from "@/services/settings"

import { Button } from "@/components/ui/button"
import { PlansOverlay } from "@/components/plans-overlay"

import { Sparkles, Loader2 } from "lucide-react"

import { AI_CONFIG } from "@/lib/constants/ai"

import type { Role } from "@prisma/client"
import type { AIContextType } from "@/lib/types"

interface AICreatorProps {
  reference: string // O nome ou conteúdo base
  onGenerated: (content: string) => void
  type: AIContextType
}

export const AICreator = ({ reference, onGenerated, type }: AICreatorProps) => {
  const queryClient = useQueryClient()
  const config = AI_CONFIG[type]

  const { data: settings, isLoading: isSettingsLoading } = useQuery<any>({
    queryKey: ["user-settings"],
    queryFn: () => fetchUserSettings(),
  })

  const userRole = settings?.user?.role as Role
  const usage = settings?.user?.usage
  const hasAccess = userRole === "STARTER" || userRole === "PREMIUM" || userRole === "ADMIN"
  const remaining = usage ? usage.aiLimit - usage.aiGenerationsUsed : 0

  const { mutate, isPending } = useMutation({
    mutationKey: ["generate-ai-content", type],
    mutationFn: async (name: string) => {
      const { data } = await axios.post('/api/ia/generator', {
        messages: [
          { 
            role: "system", 
            content: `Você é um especialista em produtividade e alta performance. ${config.prompt} Não use aspas. Resposta curta e direta.` 
          },
          { role: "user", content: `${type}: ${name}` }
        ]
      });
      return data;
    },
    onSuccess: async (data) => {
      onGenerated(data.content);
      await queryClient.invalidateQueries({
        queryKey: ["user-settings"]
      })
      toast.success(`${config.field.charAt(0).toUpperCase() + config.field.slice(1)} gerada! ✨`);
    },
    onError: (error: any) => {
      const message = error.response?.data?.error;
      if (message === "LIMIT_REACHED") {
        toast.error("Limite mensal de IA atingido. 🚀");
      } else {
        toast.error("Erro ao gerar conteúdo.");
      }
    }
  })

  const ActionButton = (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={isPending || !reference || reference.length < 3 || isSettingsLoading}
      onClick={() => mutate(reference)}
      className="h-8 gap-2 border-primary/20 bg-secondary/50 hover:bg-secondary text-xs transition-all duration-300 shadow-sm relative group"
    >
      {isPending || isSettingsLoading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Sparkles className="h-3 w-3 text-purple-400 group-hover:rotate-12 transition-transform" />
      )}
      
      <span>Gerar {config.field}</span>

      {hasAccess && usage && (
        <span className="ml-1 text-[10px] opacity-50">
          ({remaining})
        </span>
      )}
    </Button>
  )

  if (isSettingsLoading) return ActionButton

  return (
    <PlansOverlay isPremium={hasAccess}>
      {ActionButton}
    </PlansOverlay>
  )
}