"use client"

import React, { useState } from "react"
import { toast } from "react-toastify"

import HeatMapHabit from "@/components/heat-map"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WEEKDAYS, WEEKDAY_MAP } from "@/lib/habit-utils"

import {
UpdateHabitDialog,
UpdateHabitSchemaType
} from "./update-habit-dialog"

import { cn } from "@/lib/utils"

import type { HabitWithStats } from "@/lib/types"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"


import {
  X,
  Pencil,
  Trash2,
  TrendingUp,
  Eye,
  Check,
  EyeIcon
} from "lucide-react"
import { Progress } from "./ui/progress"
import { Skeleton } from "./ui/skeleton"
import { HabitDetailDialog } from "./habit-detail-dialog"

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
  selectedDate?: Date
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

export function HabitCard({
  habit,
  onToggle,
  onEdit,
  onDelete,
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
    habit.completions
    .filter(c => {
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
    return completionDate === todayStr
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

  const completedDays = habit.completions.length
  const totalDays = habit.endDate?.length ?? 365

  const progress =
    totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0
  
  return (
    <Card
      className={`group p-5 bg-linear-to-br transition-all hover:shadow-lg cursor-pointer ${
        isCompletedToday && onToggle
          ? "from-lime-500/20 to-green-700/5 border-green-700/30 hover:border-green-500/30"
          : "from-card-800 to-card/50 border-border/50 hover:border-card-700"
      } ${loading && 'opacity-50'}`}
      onClick={(e) => {
        if (loading) return
        if ((e.target as HTMLElement).closest("button")) return
        onClick?.()
      }}
    >
      {/* INFO */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div
            className="flex items-center justify-center w-14 h-14 rounded-2xl text-3xl shrink-0 shadow-sm"
            style={{ backgroundColor: `${habit.color}20` }}
          >
            {loading ? (
              <Skeleton className="w-14 h-14 rounded-2xl shrink-0" />
            ) : (
              habit.emoji
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {loading ? (
                <div className="flex w-full justify-between">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-5 w-10 rounded-full" />
                </div>
              ) : (
                <div className="flex items-center w-full">
                  <h3 className="font-bold w-full sm:text-lg text-md text-foreground">
                    {habit.name}
                  </h3>
                  {habit.current_streak > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {habit.current_streak}
                    </span>
                  )}
                  </div>
              )}
            </div>
            {!loading ?(
              <p className="text-sm text-muted-foreground mb-3">
                {habit.goal}
              </p>
            ) : (
              <Skeleton className="h-4 w-64 mb-4 mt-2" />
            )}
            
            {!loading ? (
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1">
                  {WEEKDAYS.map((day) => {
                    const isActive = frequency.includes(day.key)

                    // ✅ agora olha para TODAS as conclusões da semana
                    const isCompletedThisWeekday =
                      completionFrequency.includes(day.key)

                    return (
                      <div
                        key={day.key}
                        className={cn(
                          'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all',
                          isActive
                            ? "text-foreground shadow-sm "
                            : "bg-muted/50 text-muted-foreground"
                        )}
                        style={
                          isActive
                            ? {
                                backgroundColor: isCompletedThisWeekday
                                  ? "#32CD32"        // 🟢 completado
                                  : "#B22222"      // 🔵 ativo (schedule)
                              }
                            : {}
                        }
                      >
                        {
                          !isActive ? day.keyPtBr 
                          : isCompletedThisWeekday ? <Check /> 
                          : day.keyPtBr
                        }
                      </div>
                    )
                  })}
                </div>
                <div className="flex items-center justify-between gap-2 w-full">
                  <span className="w-full text-xs text-muted-foreground font-medium">
                    {habit.completions.length > 0 && habit.endDate ? (
                      <p className="">
                        {habit.completions.length} de {habit.endDate?.length} dias
                      </p>
                    ) : habit.completions.length === 0 ? (
                      <p className="text-muted-foreground">Comece hoje</p>
                    ) : !habit.endDate ? (
                      <p className="">
                        {habit.completions.length} conclúidos
                      </p>
                    ) : (
                      <p className="">Nenhum dia ainda</p>
                    )}
                  </span>
                  <Progress
                    className="w-full h-1 mt-1 bg-gray-800"
                    color={habit.color}
                    value={progress}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <Skeleton
                      key={i}
                      className="w-7 h-7 rounded-lg"
                    />
                  ))}
                </div>
                {/* Progress text + bar */}
                <div className="flex items-center justify-between gap-2 w-full">
                  <Skeleton className="h-3 w-26" />
                  <Skeleton className="h-1 w-full rounded-full" />
                </div>
              </div>
            )}
          </div>
        </div>
        
        {!loading ?(
          <div
            className={cn(
              "flex items-center gap-1.5 transition-opacity",
              "opacity-100 md:opacity-0 md:group-hover:opacity-100",
            )}
          >
            {onEdit && (
              <UpdateHabitDialog
                habit={habit}
                onSuccessCallback={(data) => onEdit(data)}
                trigger={
                  <Button
                    variant="ghost"
                    disabled={!onEdit}
                    size="icon"
                    className="h-9 w-9 hover:bg-muted"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                }
              />
            )}

            {/* CRIAR O DELETEDIALOGHABIT */}
            {onDelete && (
              <Button
                variant="ghost"
                disabled={!onDelete}
                size="icon"
                className="h-9 w-9 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm("Are you sure you want to delete this habit?")) {
                    onDelete(habit.id)
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}

            <HabitDetailDialog
              habit={habit}
              trigger={
                <Button
                  disabled={loading}
                  size="icon"
                  className="flex items-center bg-transparent"
                >
                  <EyeIcon />
                </Button>
              }
            />

            {/*  */}
            {onToggle && (
              <Button
                variant={isCompletedToday ? "default" : "outline"}
                size="icon"
                disabled={loading}
                className={cn(
                  "flex items-center rounded-full transition-all",
                  isCompletedToday && "shadow-md bg-transparent hover:bg-red-600/80",
                  !isCompletedToday &&
                    !canToggle &&
                    "opacity-50 cursor-not-allowed bg-red-500/10 border-red-500/30 text-red-500",
                  !isCompletedToday &&
                    canToggle &&
                    "hover:border-primary/50 hover:bg-primary/5",
                )}
                onClick={handleToggleClick}
              >
                {isCompletedToday ? (
                  <X className="h-5 w-5" />   // 👉 DESMARCAR
                ) : !canToggle ? (
                  <X className="h-5 w-5" />   // 👉 BLOQUEADO
                ) : (
                  <div className="h-4 w-4 rounded-full border border-current" /> // 👉 MARCAR
                )}
              </Button>
            )}
            
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-6 w-6 rounded-md" />
            <Skeleton className="h-6 w-6 rounded-md" />
            <Skeleton className="h-6 w-6 rounded-md" />
            {/* <Skeleton className="h-6 w-6 rounded-full" /> */}
          </div>
        )}
      </div>
      
      {/* COLLAPSIBLE SHOW HEATMAP */}
      {onEdit && (
        <Collapsible
          open={show}
          onOpenChange={setShow}
          className="flex w-full flex-col"
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className="flex flex-row gap-2 items-center w-full"
            >
              <Eye className="text-sm text-muted-foreground" />
              <p className="text-sm">
                Visualizar gráfico de atividade
              </p>
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="flex items-center justify-between">
            <div className="overflow-x-auto">
              <div className="w-full">
                <HeatMapHabit
                  endDate={habit.endDate ? new Date(habit.endDate) : null}
                  habitColor={habit.color}
                  habitFrequency={habit.frequency}
                  startDate={new Date(habit.startDate)}
                  completions={habit.completions}
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

    </Card>
  )
}
