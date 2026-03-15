"use client"

import React, { useCallback, useState } from "react"

import DeleteHabitDialog from "@/components/delete-habit-dialog"

import {
  UpdateHabitDialog,
} from "@/components/update-habit-dialog"
import { HabitDetailDialog } from "@/components/habit-detail-dialog"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

import { cn } from "@/lib/utils"

import { WEEKDAYS, WEEKDAY_MAP } from "@/lib/habit-utils"

import {
  Pencil,
  Trash2,
  TrendingUp,
  Check,
  EyeIcon,
  Clock10Icon,
  Repeat,
  TimerIcon,
  MoreVertical,
  File,
} from "lucide-react"

import type { HabitWithStats } from "@/lib/types"
import type { UpdateHabitSchemaType } from "@/lib/schema/habit"

import CreateAnnotationDialog from "./annotations/create-annotation-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "./ui/dropdown-menu"

import { updateHabit } from "@/services/habits"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

const WEEKDAY_TO_FREQUENCY: Record<number, string> = {
  0: 'S',   // Sunday
  1: 'M',
  2: 'T',
  3: 'W',
  4: 'TH',
  5: 'F',
  6: 'SA',
}

interface HabitCardProps {
  habit: HabitWithStats
  onToggle?: (habitId: string) => void
  onEdit?: (habit: UpdateHabitSchemaType) => void
  onDelete?: (habitId: string) => void
  onClick?: () => void
  selectedDate: Date
  loading: boolean
  onError?: (message: string) => void
}

function getStartOfWeek(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - d.getDay())
  return d
}

function getEndOfWeek(date: Date) {
  const d = getStartOfWeek(date)
  d.setDate(d.getDate() + 6)
  d.setHours(23, 59, 59, 999)
  return d
}

function timeToSeconds(time: string) {
  const [h, m, s] = time.split(":").map(Number)
  return h * 3600 + m * 60 + s
}

function getCurrentTimeHHMMSS(date: Date) {
  return new Date(date).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
}

export function HabitCard({
  habit,
  onToggle,
  onClick,
  selectedDate,
  onError,
  loading,
}: HabitCardProps) {
  const [show, setShow] = useState<boolean>(false)
  // Calcula o início da semana com base na data selecionada
  // Ex: segunda-feira 00:00:00
  const startOfWeek = getStartOfWeek(selectedDate ? new Date(selectedDate) : new Date())
  // Calcula o final da semana com base na data selecionada
  // Ex: domingo 23:59:59
  const endOfWeek = getEndOfWeek(selectedDate ? new Date(selectedDate) : new Date())
  // Cria um Set (estrutura que NÃO permite valores duplicados)
  // Ele vai armazenar as datas únicas em que o hábito foi concluído na semana
  const completionSet = new Set(
    // Filtra apenas conclusões válidas dentro da semana atual
    habit?.completions?.filter(c => {
      if (!c.completedDate) return false
      // Converte a data de conclusão em Date
      const d = new Date(c.completedDate)
        .toISOString()
        .split('T')[0]
        .replace(/-/g, '/')

      // Mantém apenas datas entre início e fim da semana
      return d >= startOfWeek
        .toISOString()
        .split('T')[0]
        .replace(/-/g, '/') 
      && 
        d <= endOfWeek
        .toISOString()
        .split('T')[0]
        .replace(/-/g, '/')
    })
    // Converte a data para string no formato YYYY/MM/DD
    // Isso evita problemas de timezone ao comparar datas
    .map(c =>
      new Date(c.completedDate!)
      .toISOString()
      .split('T')[0]
      .replace(/-/g, '/')
    )
  )
  // Converte cada data única para o dia da semana (0 a 6)
  // e mapeia para a frequência do hábito
  const completionFrequency = Array.from(completionSet).map(dateStr => {
    // Quebra a string da data em números
    const [year, month, day] = dateStr.split('/').map(Number)
    // Cria a data manualmente para evitar bug de fuso horário
    // (mês começa em 0 no JS)
    const date = new Date(year, month - 1, day)
    date.setHours(0 ,0, 0, 0)
    // Retorna a frequência associada ao dia da semana
    return WEEKDAY_TO_FREQUENCY[date.getDay()]
  })
  // Garante que a frequência do hábito seja um array
  // (caso venha null, undefined ou outro formato)
  const frequency =
    Array.isArray(habit.frequency) ? habit.frequency : []
  // Define a data atual com base na data selecionada
  // Se não existir, usa a data de hoje
  const currentDate =
    selectedDate || new Date()
  // Cria uma string da data atual no formato YYYY-MM-DD
  // Usada para comparação direta
  const todayStr =
    currentDate.toISOString().split("T")[0]
  // Verifica se o hábito já foi concluído hoje
  const isCompletedToday = habit.completions?.some((c) => {
    const completionDate = new Date(c.completedDate).toISOString().split("T")[0]
    console.log({completionDate}, {todayStr}, 'is completion today')
    const limit = habit.limitCounter || 1
    const counter = c.counter || 0

    return completionDate === todayStr && counter === limit
  })
  // Obtém o dia da semana atual (0 = domingo, 6 = sábado)
  const currentDayOfWeek = currentDate.getDay()
  // Converte o número do dia da semana para as chaves do WEEKDAY_MAP
  // Ex: 1 → ["MONDAY"]
  const currentDayKeys = Object.entries(WEEKDAY_MAP)
    .filter(([_, value]) => value === currentDayOfWeek)
    .map(([key]) => key)
  // Verifica se o hábito está ativo hoje
  // Ex: se hoje é segunda e o hábito inclui "MONDAY"
  const isActiveToday =
    currentDayKeys.some((key) => frequency.includes(key))
  // Cria a data de hoje zerando horas (00:00:00)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  // Normaliza a data selecionada (remove horas)
  const checkDate = new Date(currentDate)
  checkDate.setHours(0, 0, 0, 0)
  // Verifica se a data selecionada está no futuro
  const isFutureDate = checkDate > today
  // Define se o usuário pode marcar/desmarcar o hábito
  // Regras:
  // - O hábito precisa estar ativo hoje
  // - A data não pode ser futura 
  const canToggle = isActiveToday && !isFutureDate

  const counter = 
    habit?.completions?.find(
      (c) => 
        new Date(c.completedDate).toISOString().split("T")[0] === 
       currentDate.toISOString().split("T")[0]
    )?.counter || 0

  const limit = habit.limitCounter ?? 1

  const completedProgress =
    limit > 0
      ? Math.min(counter / limit) * 100
      : 0

  const isCompleted = counter === limit

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation()

    if (!canToggle) {
      if (isFutureDate) {
        onError?.("❌ Não é possível concluir um hábito futuro")
        toast.error("❌ Não é possível concluir um hábito futuro")
      } else if (!isActiveToday) {
        onError?.("❌ Este hábito não está agendado para este dia")
        toast.error("❌ Este hábito não está agendado para este dia")
      }
      return
    }

    onToggle && 
      onToggle(habit.id)
  }


  const queryClient = useQueryClient()

  const handleUpdateHabit = useCallback((data: UpdateHabitSchemaType) => {
    updateHabitMutation.mutate(data)
  }, [])

  const updateHabitMutation = useMutation({
    mutationFn: updateHabit,
    onMutate: () => {
      return toast.loading(
        "Atualizando hábito...",
        { id: "update-habit" }
      )
    },
    onSuccess: (_, __, toastId) => {
      queryClient.invalidateQueries({
        queryKey: ["habits"],
        exact: false,
      })
      queryClient.invalidateQueries({
        queryKey: ['routines'],
      })
      toast.success(
        "Hábito atualizado com sucesso.",
        { id: toastId }
      )
    },
    onError: (error: any, _, toastId) => {
      toast.error(
        error?.message ?? "Erro ao atualizar hábito",
        { id: toastId }
      )
    },
  })

  const now = timeToSeconds(getCurrentTimeHHMMSS(selectedDate))

  const start = habit.clock
    ? timeToSeconds(habit.clock)
    : null

  const duration =
    habit.duration
      ? timeToSeconds(habit.duration)
      : 3600

  const isActiveHour =
    start !== null && now >= start && now <= start + duration

  const isOutHour =
    start !== null && now > start + duration

  const completedDays = habit.completions?.length || 0
  const totalDays = habit.endDate?.length ?? 365

  const progress =
    totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0

  const todayCompletion =
    habit.completions?.find(
      c =>
        new Date(c.completedDate).toISOString().split("T")[0] ===
        selectedDate.toISOString().split("T")[0]
    ) ?? null

  return (
    <Card
      className={`group p-5 bg-linear-to-br transition-colors hover:shadow-lg cursor-pointer h-full ${
        isCompletedToday && onToggle
          ? "from-lime-500/20 to-green-700/5 border-green-700/30 hover:border-green-500/30"
          // : isActiveHour && !isCompleted && onToggle && selectedDate.toISOString().split("T")[0] === today.toISOString().split("T")[0]
          // ? "from-yellow-500/60 to-yellow-700/10 border-yellow-700/30 hover:border-yellow-500/30"
          // : isOutHour && !isCompleted && onToggle && selectedDate.toISOString().split("T")[0] === today.toISOString().split("T")[0]
          // ? "from-red-500/60 to-red-700/10 border-red-700/30 hover:border-red-500/30"
          : todayCompletion?.counter && todayCompletion?.counter >= 1 &&
            habit.limitCounter && habit.limitCounter > 1
             && onToggle ? "from-blue-500/20 to-purple-700/5 border-purple-700/30 hover:border-purple-500/30"
          : "from-card-800 to-card/50 border-border/50 hover:border-card-700"
      } ${loading && 'opacity-50'}`}
      onClick={(e) => {
        if (loading) return
        if ((e.target as HTMLElement).closest("button")) return
        onClick?.()
      }}
    >
      {/* INFO */}
      <div aria-selected={false} className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {/* COUNTER CHECKBOX */}
          {onToggle && (
            <Button
              variant={isCompleted ? "default" : "outline"}
              size="icon"
              disabled={loading}
              onClick={handleToggleClick}
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center transition",
                isCompleted
                  ? `bg-primary text-white`
                  : "bg-background border border-border"
              )}
            >
              {isCompleted && <Check className="w-5 h-5" />}
            </Button>
          )}
          
          {/* DETAIL SECTION */}
          <div className="h-full">
            <div className="mb-1">
              {loading ? (
                <div className="flex w-full justify-between gap-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-5 w-10 rounded-full" />
                </div>
              ) : (
                <div className="flex items-center w-full space-x-2">
                  <div className="flex flex-row gap-1 items-center">
                    {/* EMOJI */}
                    <div
                      className="flex items-center justify-center w-8 h-8 rounded-2xl text-3xl shrink-0 shadow-sm"
                      style={{ backgroundColor: `${habit.color}20` }}
                    >
                      {loading ? (
                        <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
                      ) : (
                        <p className="text-sm">{habit.emoji}</p>
                      )}
                    </div>
                    <h3 className="font-bold w-full max-w-54 truncate tracking-tighter text-foreground">
                      {habit.name}
                    </h3>
                    {/* badge streak */}
                    {habit.current_streak > 0 && (
                      <span className="px-2 tracking-tight py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {habit.current_streak}
                      </span>
                    )}
                  </div>
 
                  {/* {habit.updatedAt && <Button variant="outline" size="icon"> <Calendar1 className="text-sm" /></Button>} */}
                  </div>
              )}
            </div>
            
            {/* BADGES (COUNTER, CLOCK) */}
            {!loading ? (
              <div className="flex flex-col gap-2">
                {habit.limitCounter && habit.limitCounter > 1 && (
                  <Badge
                    variant="outline"
                  >
                    <Repeat className="text-sm" />
                    <p className="text-sm tracking-tight">
                      {counter || 0}/{habit?.limitCounter} {" "} {habit?.customField}
                    </p>
                  </Badge>
                )}
                
                {habit.goals && habit.goals.length > 0 && (
                  <p className="text-[10px] text-muted-foreground truncate max-w-54">
                    {habit.goals.map((g) => g.emoji + " " + g.name).join(", ")}
                  </p>
                )}
                {habit.categories && habit.categories.length > 0 && (
                  <p className="text-[10px] max-w-36 text-muted-foreground truncate">
                    {habit.categories.map((g) => g.emoji + " " + g.name).join(", ")}
                  </p>
                )}

                <div className="flex flex-row gap-2 mt-2">
                  {habit.clock && (
                    <Badge
                      variant="default"
                      className={
                        cn(
                          "text-sm flex flex-row gap-2 text-foreground mb-3",
                          isActiveHour && 'bg-yellow-500/60',
                          isOutHour && 'bg-red-500/60',
                          isCompleted && 'bg-green-500/60'
                        )
                      }
                    >
                      <Clock10Icon /> {habit?.clock}
                    </Badge>
                  )}
                  {habit.duration && (
                    <Badge
                      variant="secondary"
                      className="text-sm flex flex-row gap-2 text-foreground mb-3"
                    >
                      <TimerIcon />
                      {habit.duration}
                    </Badge>
                  )}
                </div>

              </div>
            ) : (
              <Skeleton className="h-4 w-32 mb-4 mt-2" />
            )}
            
            {/* FREQUENCY */}
            {!loading ? (
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  {WEEKDAYS.map((day) => {
                    const isActive = frequency.includes(day.key)

                    const isCompletedThisWeekday =
                      completionFrequency.includes(day.key)

                    return (
                      <div
                        key={day.key}
                        className="flex flex-col items-center gap-1"
                      >
                        {/* CIRCULO */}
                        <div
                          className={cn(
                            "w-5.5 h-5.5 rounded-full border border-gray-800 flex items-center justify-center text-sm font-bold transition-colors",
                            !isActive && "bg-zinc-800 text-zinc-400",
                            isActive && !isCompletedThisWeekday && "bg-red-500 text-white",
                            isActive && isCompletedThisWeekday && "bg-green-500 text-white"
                          )}
                        >
                          <p className="text-sm tracking-tight">
                            {day.keyPtBr}
                          </p>
                        </div>

                        {/* DOT */}
                        <div
                          className={cn(
                            "w-1 h-1 rounded-full",
                            !isActive && "bg-zinc-700",
                            isActive && !isCompletedThisWeekday && "bg-red-500",
                            isActive && isCompletedThisWeekday && "bg-green-500"
                          )}
                        />
                      </div>
                    )
                  })}
                </div>
                
                <div className="flex items-center justify-between gap-2 w-full">
                  <span className="w-full text-xs text-muted-foreground font-medium">
                    {habit.completions?.length || 0 > 0 && habit.endDate ? (
                      <p className="">
                        {habit.completions?.length} de {habit.endDate?.length} dias
                      </p>
                    ) : habit.completions?.length === 0 ? (
                      <p className="text-muted-foreground">Comece hoje</p>
                    ) : !habit.endDate ? (
                      <p className="">
                        {habit.completions?.length} concluídos
                      </p>
                    ) : (
                      <p className="">Nenhum dia ainda</p>
                    )}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <Skeleton
                      key={i}
                      className="w-6 h-6 rounded-lg"
                    />
                  ))}
                </div>
                {/* Progress text + bar */}
                <div className="flex flex-col items-start justify-between gap-2 w-full">
                  <Skeleton className="h-3 w-22" />
                  <Skeleton className="h-1 w-full rounded-full" />
                </div>
              </div>
            )}
            {!loading && (
              <Progress
                className="w-full gradient-progress h-1 mt-1 bg-gray-800 transition-all duration-500"
                value={progress}
              />
            )}
          </div>
        </div>
        
        {/* ACTIONS (UPDATE, DELETE) */}
        {!loading ?(
          <div
            className={cn(
              "flex justify-center items-center gap-1 transition-opacity",
              "opacity-100 md:opacity-0 md:group-hover:opacity-100",
            )}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                {/* EDIT */}
                <UpdateHabitDialog
                  habit={habit}
                  onSuccessCallback={handleUpdateHabit}
                  trigger={
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="cursor-pointer"
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                  }
                />
                <DropdownMenuSeparator />
                {/* DELETE */}
                <DeleteHabitDialog
                  habitId={habit.id}
                  trigger={
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="text-destructive focus:text-destructive cursor-pointer"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Deletar
                    </DropdownMenuItem>
                  }
                />

                <HabitDetailDialog
                  currentDate={selectedDate || new Date()}
                  habit={habit}
                  trigger={
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      disabled={loading}
                    >
                      <EyeIcon className="mr-2 h-4 w-4" />
                      Detalhes
                    </DropdownMenuItem>
                  }
                /> 
                {/* ANNOTATION */}
                {isCompleted && !!todayCompletion?.id && (!todayCompletion.annotations) && (
                  <CreateAnnotationDialog
                    completionId={todayCompletion.id}
                    trigger={
                      <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        disabled={loading}
                      >
                        <File className="mr-2 h-4 w-4" />
                        Anotação
                      </DropdownMenuItem>
                    }
                    
                  />
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-6 w-6 rounded-md" />
          </div>
        )}
      </div>
    </Card>
  )
}
