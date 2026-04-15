"use client"

import React, {
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'

import { Input } from '@/components/ui/input'
import {
  Flame,
  Loader2,
  Mic,
  MicOff,
  Plus,
  Settings,
  Users,
  X
} from 'lucide-react'
import DayStreak from './components/day-streak'
import FriendInvite from './components/friend-invite'
import PermissionsModal from './components/permissions-modal'
import Footer from '@/components/habits/footer'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { User, UserSettings, UserUsage } from '@prisma/client'
import { fetchUserSettings } from '@/services/settings'
import { useUser } from '@clerk/nextjs'
import CreateRoutineDialog from '@/components/create-routine-dialog'
import { CreateHabitDialog } from '@/components/create-habit-dialog'
import CreateTaskDialog from '@/components/tasks/create-task-dialog'
import CreateGoalDialog from '@/components/goals/create-goal-dialog'
import CreateCategorieDialog from '@/components/categories/create-categorie-dialog'
import { PlansOverlay } from '@/components/plans-overlay'
import HeaderSection from '@/components/habits/header-section'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import CreateGoalStepDialog from '@/components/goals/create-goal-step-dialog'
import { CreateCategorieStepDialog } from '@/components/categories/create-categorie-step-dialog'
import CreateTaskDialogSteps from '@/components/tasks/create-task-step-dialog'
import { CreateHabitStepDialog } from '@/components/habits/create-habit-step-dialog'
import CreateRoutineStepDialog from '@/components/routines/create-routine-step-dialog'
import { FullEntityWizard } from './components/full-wizard'

interface ActionItem {
  id: string
  icon: React.ReactNode
  title: string
  description: string
}

interface VoiceResponse {
  action: string
  title?: string
  description?: string
  response: string
}

const actions: ActionItem[] = [
  {
    id: "routine",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5" />
      </svg>
    ),
    title: "Criar Rotina",
    description: "Automatize suas tarefas diárias.",
  },
  {
    id: "habit",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v4" />
        <path d="m6.8 14-3.5 2" />
        <path d="m20.7 16-3.5-2" />
        <path d="M6.8 10 3.3 8" />
        <path d="m20.7 8-3.5 2" />
        <circle cx="12" cy="12" r="6" />
      </svg>
    ),
    title: "Criar Hábito",
    description: "Construa hábitos que transformam.",
  },
  {
    id: "task",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
    title: "Criar Tarefa",
    description: "Organize suas atividades do dia.",
  },
  {
    id: "goal",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
        <line x1="4" x2="4" y1="22" y2="15" />
      </svg>
    ),
    title: "Criar Meta",
    description: "Defina e alcance seus objetivos.",
  },
  {
    id: "category",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 3H6a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z" />
        <path d="M18 3h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z" />
        <path d="M18 13h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2Z" />
      </svg>
    ),
    title: "Criar Categoria",
    description: "Organize tudo em categorias.",
  },
]

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2L13.09 8.26L18 6L14.74 10.91L21 12L14.74 13.09L18 18L13.09 15.74L12 22L10.91 15.74L6 18L9.26 13.09L3 12L9.26 10.91L6 6L10.91 8.26L12 2Z"
        fill="currentColor"
      />
    </svg>
  )
}

const WizzardScreen = () => {
  const { user } = useUser()
  const {
    data: userSettings,
  } = useQuery<UserSettings & { user: User & { UserUsage: UserUsage }}>({
    queryKey: ["user-settings"],
    queryFn: () => fetchUserSettings(),
  })

  const [currentScreen, setCurrentScreen] = useState<"wizard" | "streak" | "invite">("wizard")
  const [showPermissions, setShowPermissions] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [transcript, setTranscript] = useState("")
  const [aiResponse, setAiResponse] = useState<VoiceResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
    
  const recognitionRef = useRef<any | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["streak"],
    queryFn: async () => {
      const res = await fetch("/api/streak")
      return res.json()
    }
  })

  // Inicializar Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = "pt-BR"
      }
    }
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
  }, [])

  // 1. Estado para controlar qual campo a IA está esperando (ex: 'name')
  const [expectedField, setExpectedField] = useState<string | null>(null);
  // 2. Função para abrir os modais de criação baseado na ação da IA
  const handleOpenModal = useCallback((action: string, initialData: any) => {
    // Aqui você deve disparar a lógica que já usa no Lab Habit para abrir modais
    // Exemplo hipotético usando uma store ou state:
    console.log(`Abrindo modal de ${action} com dados:`, initialData);
    
    if (action === "habit") {
      // openHabitModal(initialData)
    } else if (action === "task") {
      // openTaskModal(initialData)
    }
  }, []);
  const processVoiceCommand = useCallback(async (text: string) => {
    if (!text.trim()) return;

    setIsProcessing(true);
    setError(null);
    
    try {
      const response = await axios.post("/api/ia/voice", { 
        transcript: text.toLowerCase() 
      });
      
      const data = response.data;

      // Lógica para dados incompletos
      if (data.status === "INCOMPLETE") {
        toast.info(data.message, { icon: "🎙️" });
        
        // Agora o TypeScript encontra o setExpectedField
        setExpectedField(data.missingField); 
        setInputValue(""); 
        return; 
      }

      // Caso de Sucesso
      if (data.status === "SUCCESS") {
        const { action, name } = data.data;

        setAiResponse(data.data);
        setInputValue(name);

        const actionElement = document.getElementById(`action-${action}`);
        if (actionElement) {
          actionElement.classList.add("ring-2", "ring-[#38bdf8]", "animate-pulse");
          setTimeout(() => {
            actionElement.classList.remove("ring-2", "ring-[#38bdf8]", "animate-pulse");
          }, 3000);
        }

        toast.success(`Entendido! Criando ${action}: ${name}`);
        
        // Agora o TypeScript encontra o handleOpenModal
        handleOpenModal(action, { name });
        
        // Resetamos o campo esperado pois a ação foi concluída
        setExpectedField(null);
      }

    } catch (err: any) {
      // ... seu tratamento de erro anterior ...
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  }, [setExpectedField, handleOpenModal]); // Dependências agora válidas

  const startListening = useCallback(async () => {
    setError(null)
    setAiResponse(null)
    
    if (recognitionRef.current) {
      // Usar Web Speech API
      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = ""
        let interimTranscript = ""
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }
        
        setTranscript(interimTranscript || finalTranscript)
        
        if (finalTranscript) {
          setTranscript(finalTranscript)
          processVoiceCommand(finalTranscript)
        }
      }
      
      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error)
        setIsListening(false)
        if (event.error === "not-allowed") {
          setError("Permissão de microfone negada. Por favor, permita o acesso.")
        } else {
          setError("Erro ao reconhecer voz. Tente novamente.")
        }
      }
      
      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
      
      try {
        recognitionRef.current.start()
        setIsListening(true)
        setTranscript("")
      } catch (err) {
        console.error("Error starting recognition:", err)
        setError("Não foi possível iniciar o reconhecimento de voz.")
      }
    } else {
      setError("Reconhecimento de voz não suportado neste navegador.")
    }
  }, [processVoiceCommand])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
    }
    setIsListening(false)
  }, [])

  const toggleVoiceAssistant = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const handleAction = (actionId: string) => {
    console.log(`Ação selecionada: ${actionId}`)
    // Aqui você pode adicionar a lógica para abrir modais ou navegar
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      processVoiceCommand(inputValue)
    }
  }

  const handlePermissionsContinue = (permissions: Record<string, boolean>) => {
    console.log("Permissões:", permissions)
    setShowPermissions(false)
    // Se o microfone foi permitido, iniciar reconhecimento de voz
    if (permissions.microphone) {
      startListening()
    }
  }

  // Renderizar tela de Day Streak
  if (currentScreen === "streak") {
    return <DayStreak onBack={() => setCurrentScreen("wizard")} />
  }

  // Renderizar tela de Convite de Amigos
  if (currentScreen === "invite") {
    return <FriendInvite onBack={() => setCurrentScreen("wizard")} />
  }

  return (
    <div className="flex flex-col bg-[#0a0a0a] items-center justify-center">
      <div className="relative w-full max-w-5xl px-4 py-1">
        <HeaderSection />
        <div className="p-2">
          {/* Header Buttons */}
          <div className="flex items-center justify-between mb-8">
            {/* Day Streak Button */}
            <button 
              onClick={() => setCurrentScreen("streak")}
              className="flex items-center gap-2 bg-[#1a1512] hover:bg-[#241c14] border border-[#F97316]/30 rounded-full px-4 py-2 transition-colors"
            >
              <Flame className="h-4 w-4 text-[#F97316]" />
              <span className="text-[#F97316] text-sm font-medium">
                {data?.currentStreak || 0}
              </span>
            </button>
            {/* Friend Invite Button */}
            <button 
              onClick={() => setCurrentScreen("invite")}
              className="flex items-center gap-2 bg-[#1a1520] hover:bg-[#241a2a] border border-purple-500/30 rounded-full px-4 py-2 transition-colors"
            >
              <Users className="h-4 w-4 text-purple-400" />
            </button>

            {/* Settings/Permissions Button */}
            <button 
              onClick={() => setShowPermissions(true)}
              className="w-11 h-11 bg-[#161616] hover:bg-[#1e1e1e] rounded-full flex items-center justify-center transition-colors border border-[#222]"
              aria-label="Configurações"
            >
              <Settings className="h-4 w-4 text-[#888]" />
            </button>
          </div>

          {/* AI Icon */}
          <div className='flex flex-col gap-2'>
            <div className="mb-2">
              <div className="w-13 h-13 bg-[#131318] rounded-2xl flex items-center justify-center border border-[#1e1e24]">
                <SparklesIcon className="h-6 w-6 text-[#38bdf8]" />
              </div>
            </div>

            {/* Greeting */}
            <div className="mb-4">
              <h1 className="text-2xl tracking-tighter font-semibold text-white leading-[1.2]">
                Olá {userSettings?.name || user?.fullName}, pronto para
                <br />
                planejar <span className="text-[#38bdf8]">seu dia</span>?
              </h1>
            </div>
          </div>

          {/* AI Response */}
          {aiResponse && (
            <div className="mb-4 p-4 bg-[#111115] rounded-2xl border border-[#1e1e24] animate-in fade-in slide-in-from-top-2 duration-300">
              <p className="text-[#38bdf8] text-sm font-medium mb-1">
                Assistente IA
              </p>
              <p className="text-[#ccc] text-[14px] leading-relaxed">
                {aiResponse.response}
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 rounded-xl border border-red-500/20">
              <p className="text-red-400 text-[13px]">{error}</p>
            </div>
          )}

          {/* Actions Label */}
          <p className="text-[#666] text-[13px] font-medium mb-4 tracking-wide">
            O que você pode fazer
          </p>

          {/* Action Cards */}
          <div className="space-y-2.5 mb-6">

            {/* ROUTINE */}
            {/* <CreateRoutineDialog
              trigger={
                <div
                  id="action-routine"
                  className="w-full bg-[#111113] hover:bg-[#161618] active:scale-[0.99] rounded-2xl p-4 flex items-center gap-4 transition-all duration-200 border border-[#1a1a1c] hover:border-[#252528] group cursor-pointer"
                >
                  <div className="w-11 h-11 bg-[#1a1a1e] rounded-xl flex items-center justify-center">
                    {actions[0].icon}
                  </div>
                  <div className="text-left">
                    <h3 className="text-white text-[15px]">{actions[0].title}</h3>
                    <p className="text-[#555] text-[13px]">{actions[0].description}</p>
                  </div>
                </div>
              }
            /> */}
            <CreateRoutineStepDialog
              trigger={
                <div
                  id="action-routine"
                  className="w-full bg-[#111113] hover:bg-[#161618] active:scale-[0.99] rounded-2xl p-4 flex items-center gap-4 transition-all duration-200 border border-[#1a1a1c] hover:border-[#252528] group cursor-pointer"
                >
                  <div className="w-11 h-11 bg-[#1a1a1e] rounded-xl flex items-center justify-center">
                    {actions[0].icon}
                  </div>
                  <div className="text-left">
                    <h3 className="text-white text-[15px]">{actions[0].title}</h3>
                    <p className="text-[#555] text-[13px]">{actions[0].description}</p>
                  </div>
                </div>
              }
            />

            {/* HABIT */}
            {/* <CreateHabitDialog
              trigger={
                <div
                  id="action-habit"
                  className="w-full bg-[#111113] hover:bg-[#161618] active:scale-[0.99] rounded-2xl p-4 flex items-center gap-4 border border-[#1a1a1c] hover:border-[#252528] group cursor-pointer"
                >
                  <div className="w-11 h-11 bg-[#1a1a1e] rounded-xl flex items-center justify-center">
                    {actions[1].icon}
                  </div>
                  <div>
                    <h3 className="text-white text-[15px]">{actions[1].title}</h3>
                    <p className="text-[#555] text-[13px]">{actions[1].description}</p>
                  </div>
                </div>
              }
            /> */}
            <CreateHabitStepDialog
              trigger={
                <div
                  id="action-habit"
                  className="w-full bg-[#111113] hover:bg-[#161618] active:scale-[0.99] rounded-2xl p-4 flex items-center gap-4 border border-[#1a1a1c] hover:border-[#252528] group cursor-pointer"
                >
                  <div className="w-11 h-11 bg-[#1a1a1e] rounded-xl flex items-center justify-center">
                    {actions[1].icon}
                  </div>
                  <div>
                    <h3 className="text-white text-[15px]">{actions[1].title}</h3>
                    <p className="text-[#555] text-[13px]">{actions[1].description}</p>
                  </div>
                </div>
              }
            />

            {/* TASK */}
            {/* <CreateTaskDialog
              trigger={
                <div
                  id="action-task"
                  className="w-full bg-[#111113] hover:bg-[#161618] active:scale-[0.99] rounded-2xl p-4 flex items-center gap-4 border border-[#1a1a1c] hover:border-[#252528] group cursor-pointer"
                >
                  <div className="w-11 h-11 bg-[#1a1a1e] rounded-xl flex items-center justify-center">
                    {actions[2].icon}
                  </div>
                  <div>
                    <h3 className="text-white text-[15px]">{actions[2].title}</h3>
                    <p className="text-[#555] text-[13px]">{actions[2].description}</p>
                  </div>
                </div>
              }
            /> */}
            <CreateTaskDialogSteps
              trigger={
                <div
                  id="action-task"
                  className="w-full bg-[#111113] hover:bg-[#161618] active:scale-[0.99] rounded-2xl p-4 flex items-center gap-4 border border-[#1a1a1c] hover:border-[#252528] group cursor-pointer"
                >
                  <div className="w-11 h-11 bg-[#1a1a1e] rounded-xl flex items-center justify-center">
                    {actions[2].icon}
                  </div>
                  <div>
                    <h3 className="text-white text-[15px]">{actions[2].title}</h3>
                    <p className="text-[#555] text-[13px]">{actions[2].description}</p>
                  </div>
                </div>
              }
            />

            {/* GOAL */}
            {/* <CreateGoalDialog
              trigger={
                <div
                  id="action-goal"
                  className="w-full bg-[#111113] hover:bg-[#161618] active:scale-[0.99] rounded-2xl p-4 flex items-center gap-4 border border-[#1a1a1c] hover:border-[#252528] group cursor-pointer"
                >
                  <div className="w-11 h-11 bg-[#1a1a1e] rounded-xl flex items-center justify-center">
                    {actions[3].icon}
                  </div>
                  <div>
                    <h3 className="text-white text-[15px]">{actions[3].title}</h3>
                    <p className="text-[#555] text-[13px]">{actions[3].description}</p>
                  </div>
                </div>
              }
            /> */}
            <CreateGoalStepDialog
              trigger={
                <div
                  id="action-goal"
                  className="w-full bg-[#111113] hover:bg-[#161618] active:scale-[0.99] rounded-2xl p-4 flex items-center gap-4 border border-[#1a1a1c] hover:border-[#252528] group cursor-pointer"
                >
                  <div className="w-11 h-11 bg-[#1a1a1e] rounded-xl flex items-center justify-center">
                    {actions[3].icon}
                  </div>
                  <div>
                    <h3 className="text-white text-[15px]">{actions[3].title}</h3>
                    <p className="text-[#555] text-[13px]">{actions[3].description}</p>
                  </div>
                </div>
              }
            />

            {/* CATEGORY */}
            <CreateCategorieStepDialog
              trigger={
                <div
                  id="action-category"
                  className="w-full bg-[#111113] hover:bg-[#161618] active:scale-[0.99] rounded-2xl p-4 flex items-center gap-4 border border-[#1a1a1c] hover:border-[#252528] group cursor-pointer"
                >
                  <div className="w-11 h-11 bg-[#1a1a1e] rounded-xl flex items-center justify-center">
                    {actions[4].icon}
                  </div>
                  <div>
                    <h3 className="text-white text-[15px]">{actions[4].title}</h3>
                    <p className="text-[#555] text-[13px]">{actions[4].description}</p>
                  </div>
                </div>
              }
            />
            {/* <CreateCategorieDialog
              trigger={
                <div
                  id="action-category"
                  className="w-full bg-[#111113] hover:bg-[#161618] active:scale-[0.99] rounded-2xl p-4 flex items-center gap-4 border border-[#1a1a1c] hover:border-[#252528] group cursor-pointer"
                >
                  <div className="w-11 h-11 bg-[#1a1a1e] rounded-xl flex items-center justify-center">
                    {actions[4].icon}
                  </div>
                  <div>
                    <h3 className="text-white text-[15px]">{actions[4].title}</h3>
                    <p className="text-[#555] text-[13px]">{actions[4].description}</p>
                  </div>
                </div>
              }
            /> */}
          </div>

          {/* Voice Assistant Input */}
          <form onSubmit={handleSubmit} className="relative mt-4">
            {/* Voice Assistant Active State */}
            {(isListening || isProcessing) && (
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-[#111115] px-5 py-3 rounded-2xl border border-[#38bdf8]/20 shadow-lg shadow-[#38bdf8]/5 z-10 min-w-[200px]">
                {isProcessing ? (
                  <div className="flex items-center gap-3 justify-center">
                    <Loader2 className="h-5 w-5 text-[#38bdf8] animate-spin" />
                    <span className="text-[#38bdf8] text-sm font-medium">
                      Processando...
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-end gap-0.75 h-6">
                      <span className="w-0.75 bg-[#38bdf8] rounded-full animate-[soundbar_0.5s_ease-in-out_infinite]" style={{ height: '12px', animationDelay: '0s' }} />
                      <span className="w-0.75 bg-[#38bdf8] rounded-full animate-[soundbar_0.5s_ease-in-out_infinite]" style={{ height: '20px', animationDelay: '0.1s' }} />
                      <span className="w-0.75 bg-[#38bdf8] rounded-full animate-[soundbar_0.5s_ease-in-out_infinite]" style={{ height: '10px', animationDelay: '0.2s' }} />
                      <span className="w-0.75 bg-[#38bdf8] rounded-full animate-[soundbar_0.5s_ease-in-out_infinite]" style={{ height: '24px', animationDelay: '0.3s' }} />
                      <span className="w-0.75 bg-[#38bdf8] rounded-full animate-[soundbar_0.5s_ease-in-out_infinite]" style={{ height: '14px', animationDelay: '0.4s' }} />
                    </div>
                    {transcript ? (
                      <p className="text-white text-sm text-center max-w-45 truncate">{transcript}</p>
                    ) : (
                      <span className="text-[#38bdf8] text-sm font-medium">Ouvindo...</span>
                    )}
                  </div>
                )}
              </div>
            )}

            <PlansOverlay
              isPremium={userSettings?.user.role === "PREMIUM"}
            >
              <div className={`flex items-center bg-[#111113] rounded-full border overflow-hidden h-13 transition-colors ${isListening ? "border-[#38bdf8]/50" : "border-[#1a1a1c]"}`}>
                <button 
                  type="button"
                  role="button"
                  disabled={userSettings?.user.role !== "PREMIUM"}
                  className="pl-4 pr-2 text-[#555] hover:text-[#888] transition-colors shrink-0"
                  aria-label="Adicionar"
                >
                  <Plus className="h-5 w-5" strokeWidth={2} />
                </button>
                <Input
                  type="text"
                  disabled={userSettings?.user.role !== "PREMIUM"}
                  placeholder="Pergunte qualquer coisa"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="flex-1 bg-transparent text-white placeholder-[#444] py-3 px-2 outline-none text-[14px] min-w-0"
                />
                <button
                  type="button"
                  onClick={toggleVoiceAssistant}
                  disabled={userSettings?.user.role !== "PREMIUM"}
                  className={`pr-4 pl-2 transition-all duration-200 shrink-0 disabled:opacity-50 ${
                    isListening 
                      ? "text-[#38bdf8]" 
                      : "text-[#555] hover:text-[#888]"
                  }`}
                  aria-label={isListening ? "Parar de ouvir" : "Ativar voz"}
                >
                  <div className="relative">
                    {isListening ? (
                      <MicOff className="h-5 w-5" strokeWidth={2} />
                    ) : (
                      <Mic className="h-5 w-5" strokeWidth={2} />
                    )}
                    {isListening && (
                      <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#38bdf8] rounded-full animate-pulse" />
                    )}
                  </div>
                </button>
              </div>
            </PlansOverlay>
          </form>
        </div>

        <Footer />
      </div>

      <style jsx>{`
        @keyframes soundbar {
          0%, 100% {
            transform: scaleY(0.5);
          }
          50% {
            transform: scaleY(1);
          }
        }
      `}</style>
      {/* Permissions Modal */}
      <PermissionsModal 
        isOpen={showPermissions}
        onClose={() => setShowPermissions(false)}
        onContinue={handlePermissionsContinue}
      />
    </div>
  )
}

export default WizzardScreen