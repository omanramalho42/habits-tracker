"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import axios from "axios"
import { Sparkles, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { PlansOverlay } from "@/components/plans-overlay"
import { fetchUserSettings } from "@/services/settings"
import { Role } from "@prisma/client"

interface DescriptionAIProps {
  taskName: string
  onGenerated: (description: string) => void
}

export const DescriptionAI = ({ taskName, onGenerated }: DescriptionAIProps) => {
  // 1. Buscamos as configurações que agora incluem Role e Usage
  const { data: settings, isLoading: isSettingsLoading } = useQuery<any>({
    queryKey: ["user-settings"],
    queryFn: () => fetchUserSettings(),
  })

  // Extraímos os dados de forma segura
  const userRole = settings?.user?.role as Role
  const usage = settings?.user?.usage
  // console.log(userRole, usage, "userRole x usage")

  // 2. Lógica de acesso dinâmica
  const hasAccess = 
    userRole === "STARTER" || userRole === "PREMIUM" || userRole === "ADMIN"

  // 3. Cálculo de progresso/limite (Opcional: útil para mostrar no botão)
  const remaining = usage ? usage.aiLimit - usage.aiGenerationsUsed : 0

  const { mutate, isPending } = useMutation({
    mutationKey: ["generate-ai-description"],
    mutationFn: async (name: string) => {
      const { data } = await axios.post('/api/ia/description', {
        messages: [
          { 
            role: "system", 
            content: "Você é um especialista em produtividade. Crie uma descrição curta (máximo 2 frases) e motivadora para uma tarefa baseada no nome fornecido. Não use aspas." 
          },
          { role: "user", content: `Tarefa: ${name}` }
        ]
      });
      return data;
    },
    onSuccess: (data) => {
      onGenerated(data.content);
      toast.success("Descrição gerada! ✨");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error;
      if (message === "LIMIT_REACHED") {
        toast.error("Você atingiu seu limite mensal de IA. 🚀");
      } else {
        toast.error("Erro ao gerar descrição.");
      }
    }
  })

  // Componente base do botão
  const ActionButton = (
    <Button
      type="button"
      variant="outline"
      size="sm"
      // Se não tiver nome ou acesso, desabilitamos
      disabled={isPending || !taskName || taskName.length < 3 || !hasAccess || isSettingsLoading}
      onClick={() => mutate(taskName)}
      className="h-8 gap-2 border-primary/20 bg-secondary/50 hover:bg-secondary text-xs transition-all duration-300 shadow-sm relative group"
    >
      {isPending || isSettingsLoading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Sparkles className="h-3 w-3 text-purple-400 group-hover:rotate-12 transition-transform" />
      )}
      
      <span>Criar com IA</span>

      {/* Badge opcional de limite para planos pagos */}
      {hasAccess && usage && (
        <span className="ml-1 text-[10px] opacity-50">
          ({remaining})
        </span>
      )}
    </Button>
  )

  // Se estiver carregando as permissões, retornamos apenas o botão em modo loading
  if (isSettingsLoading) return ActionButton

  // Se o usuário não tiver a role necessária, envolvemos com o Overlay
  return (
    <PlansOverlay isPremium={hasAccess}>
      {ActionButton}
    </PlansOverlay>
  )

  return ActionButton
}