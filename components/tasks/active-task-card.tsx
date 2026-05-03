"use client"



import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import axios from "axios"
import confetti from "canvas-confetti"

import CreateAnnotationDialog from "@/components/annotations/create-annotation-dialog"
import DeleteTaskDialog from "@/components/tasks/delete-task-dialog"
import UpdateTaskDialog from "@/components/tasks/update-task-dialog"
import UpdateCounterDialog from "@/components/counter/update-counter-dialog"
import { TaskDetailsDialog } from "@/components/tasks/task-detail-dialog"
import MediaPreview from "@/components/midia-preview"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

import { cn, formatToBrazilDay } from "@/lib/utils"
import {
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  File,
  Files,
  MoreVertical,
  Pencil,
  PencilIcon,
  Trash2
} from "lucide-react"

import type {
  Categories,
  Counter,
  CounterStep,
  Goals,
  Task,
  TaskCompletion,
  TaskMetric,
  TaskMetricCompletion
} from "@prisma/client"
import { useState } from "react"

import PutTaskMetrics from "../task-metrics/put-task-metrics"
import { StreakCelebration } from "../v2/streak-celebration"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible"

interface ActiveTaskCardProps {
  task: (Task & {
    metrics?: (TaskMetric & {
      taskMetricCompletion: TaskMetricCompletion[]
    })[],
    completions?: TaskCompletion[]
    goals?: Goals[],
    categories?: Categories[]
    counter?: Counter & {
      CounterStep: CounterStep[],
    }
  })
  selectedDate?: Date
}

const ActiveTaskCard = ({ task, selectedDate }: ActiveTaskCardProps) => {
  const [openMetricsDialog, setOpenMetricsDialog] =
    useState<boolean>(false)
  const [isExpanded, setIsExpanded] = useState(false) // Estado para o dropdown
  const [showStreak, setShowStreak] = useState(false)

  const queryClient = useQueryClient()

  const completion = task?.completions?.find((c: any) =>
    formatToBrazilDay(c.completedDate) ===
    formatToBrazilDay(selectedDate || new Date())
  )

  const formatter = new Intl.DateTimeFormat("pt-BR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })

  const selected = formatter.format(
    new Date(selectedDate || new Date())
  )
  
  const counterDay = task?.counter?.CounterStep?.find(
    (c: CounterStep) =>
      formatter.format(new Date(c.date)) === selected
  )
  
  // console.log(task, "✨")
  // console.log(counterDay, "🔁")
  const hasCompletion = task.completions?.some((completion) => {
    if (!completion.completedDate) return false;
    
    // Garante que estamos lidando com um objeto Date
    const date = new Date(completion.completedDate);
    return formatter.format(date) === selected;
  });
  const currentStep = hasCompletion && task.limitCounter || 0
  const limit = Number(counterDay?.limit ?? task?.counter?.limit ?? 1)

  const { mutate, isPending } = useMutation({
    mutationFn: async ({ taskId, date }: any) => {
      toast.success("Atualizando status da tarefa", {
        id: "toggle-task"
      })
      console.log(taskId, date,"values")
      const res = await axios.put(
        `/api/task/${taskId}`,
        { date }
      )
      return res.data
    },
    onSuccess: async (values) => {
      toast.success("Status atualizado", {
        id: "toggle-task"
      })
      
      await queryClient.invalidateQueries({
        queryKey: ["tasks"],
      })
      await queryClient.invalidateQueries({
        queryKey: ["routines"],
      })
      await queryClient.invalidateQueries({
        queryKey: ["streak"],
      })

      if (values.isCompleted) {
        setShowStreak(true)

        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#3B82F6", "#8B5CF6", "#06B6D4", "#10B981"],
        })
      }

      if(values.step < values.limit) {
        setOpenMetricsDialog(true)
      }
    },
    onError: (error) => {
      toast.error(error?.message || "Erro ao alterar status do hábito", {
        id: "toggle-task",
      })
    }
  })

  const handleToggle = (taskId: string) => {
    mutate({
      taskId,
      date: (selectedDate || new Date()).toISOString()
    })
  }
  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded} className="w-full">
      <Card className={cn(
        "p-3 flex flex-col gap-3 transition-all",
        isExpanded && "ring-1 ring-primary/20"
      )}>
        {/* HEADER */}
        <div className="flex items-center justify-between gap-2">

          <CollapsibleTrigger asChild>
            <div className="flex items-center gap-2 min-w-0 cursor-pointer flex-1 group">
              <span className="text-lg">{task.emoji}</span>
              <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                {task.name}
              </p>
              {task.metrics && task.metrics.length > 0 && (
                isExpanded ? (
                  <ChevronUp
                    className="w-3 h-3 text-muted-foreground"
                  />
                ) : (
                <ChevronDown
                  className="w-3 h-3 text-muted-foreground"
                />
              )
              )}
            </div>
          </CollapsibleTrigger>

          {showStreak && (
            <StreakCelebration 
              open={showStreak} 
              onOpenChange={setShowStreak} 
            />
          )}

          {/* ACTIONS */}
          <div className="flex items-center gap-1">

            <MediaPreview
              imageUrl={task.imageUrl}
              videoUrl={task.videoUrl}
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <UpdateTaskDialog
                  task={task}
                  trigger={
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                  }
                />

                <DropdownMenuSeparator />

                <DeleteTaskDialog
                  taskId={task.id}
                  trigger={
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  }
                />

                {completion && (
                  <CreateAnnotationDialog
                    completionId={completion.id}
                    trigger={
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <File className="mr-2 h-4 w-4" />
                        Anotação
                      </DropdownMenuItem>
                    }
                  />
                )}

                <TaskDetailsDialog
                  task={task}
                  trigger={
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Eye className="mr-2 h-4 w-4" />
                      Detalhes
                    </DropdownMenuItem>
                  }
                />
              </DropdownMenuContent>
            </DropdownMenu>

            {/* CHECK */}
            <Button
              size="icon"
              variant={completion?.isCompleted ? "default" : "outline"}
              onClick={(e) => {
                e.stopPropagation(); // Evita abrir o dropdown ao marcar como feito
                handleToggle(task.id)
              }}
              disabled={isPending || currentStep < limit && limit !== 1}
              className={cn("rounded-full", currentStep < limit && limit !== 1 && "cursor-not-allowed")}
            >
              <Check className={cn("w-4 h-4", completion?.isCompleted ? "visible" : "hidden")} />
            </Button>

          </div>
        </div>
        
        {/* META INFO */}
        {(task?.goals && task.categories && task?.categories?.length > 0 && task.goals.length > 0 ) && (
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">

            {task.goals?.map((g: any) => (
              <span key={g.id} className="truncate">
                {g.emoji} {g.name}
              </span>
            ))}

            {task.categories?.map((c: any) => (
              <span key={c.id} className="truncate">
                {c.emoji} {c.name}
              </span>
            ))}

          </div>
        )}

        {/* DROPDOWN CONTENT (Métricas e Contador) */}
        <CollapsibleContent className="space-y-3 animate-in fade-in slide-in-from-top-1">
          <div className="h-px bg-border w-full my-1" />
          {/* COUNTER */}
          {task.counter && (
            <div className="flex flex-col gap-2 border rounded-lg p-2 bg-muted/30">

              <div className="flex items-center gap-2">
                <div className="flex flex-row items-center gap-2 w-full my-2">
                  <span className="text-lg">
                    {task.counter.emoji}
                  </span>
                  <span className="font-medium">
                    {task.counter.label}
                  </span>
                  
                  <span className="text-muted-foreground">
                    {currentStep}|{limit}
                  </span>
                  <UpdateCounterDialog
                    counter={task.counter}
                    metrics={task.metrics}
                    taskId={task.id}
                    selectedDate={selectedDate || new Date()}
                    trigger={
                      <Button
                        type="button"
                        role="button"
                        variant="outline"
                        size="sm"
                      >
                        <PencilIcon className="w-3 h-3" />
                      </Button>
                    }
                  />
                </div>
                <PutTaskMetrics
                  open={task?.metrics && task?.metrics?.length > 0 ? openMetricsDialog : false}
                  onOpenChange={setOpenMetricsDialog}
                  metrics={task.metrics || []}
                  disabled={currentStep === task.counter.limit}
                  selectedDate={selectedDate}
                  taskId={task.id}
                  index={currentStep || 1}
                  counterId={task.counter.id}
                  trigger={
                    <Button 
                      type="button"
                      role="button"
                      aria-expanded={openMetricsDialog}
                      variant="ghost"
                      disabled={currentStep >= limit}
                      size="icon-sm"
                    >
                      <Files className="w-3 h-3" />
                    </Button>
                  }
                />
                {/* CHECK */}
                <Button
                  size="icon"
                  variant={currentStep >= limit ? "default" : "outline"}
                  disabled={isPending || currentStep >= limit}
                  onClick={() => setOpenMetricsDialog(prev => !prev)}
                  className="rounded-full"
                >
                  <Check className={cn("w-4 h-4", currentStep >= limit ? "visible" : "hidden")} />
                </Button>
              </div>
              
              {/* TASK METRIC COM STEPS */}
              {task?.metrics && task.metrics.length > 0 && (
                <Tabs
                  defaultValue={String(currentStep || 1)}
                  className="scroll-container max-w-full overflox-x-auto"
                >
                  {/* 🔥 TABS HEADER */}
                  <TabsList className="grid w-full grid-cols-3">
                    {Array.from({ length: task.counter.limit }).map((_, i) => {
                      const step = String(i + 1)
                      return (
                        <TabsTrigger key={step} value={step}>
                          {`${step} ${task.counter?.label || "Step"}`}
                        </TabsTrigger>
                      )
                    })}
                  </TabsList>

                  {/* 🔥 TABS CONTENT */}
                  {Array.from({ length: task.counter.limit }).map((_, i) => {
                    const step = i + 1
                    const isCurrentStep = step === currentStep

                    const metricsWithCompletion = task.metrics?.map((metric) => {
                      // Cada metric pode ter taskMetricCompletion por step
                      const completion = metric.taskMetricCompletion?.find(
                        (c) => c.step === step
                      )

                      return {
                        ...metric,
                        completion,
                      }
                    })

                    return (
                      <TabsContent key={step} value={String(step)}>
                        <div className="grid grid-cols-1 gap-2">
                          {/* Renderização dos cards de métricas individuais (mesma lógica original) */}
                          {metricsWithCompletion?.map((metric) => (
                            <MetricItem
                              key={metric.id}
                              metric={metric}
                              isCurrentStep={step === currentStep}
                            />
                          ))}
                        </div>
                      </TabsContent>
                    )
                  })}
                </Tabs>
              )}

            </div>
          )}
        </CollapsibleContent>

      </Card>
    </Collapsible>
  )
}

// Componente auxiliar para manter o código limpo
const MetricItem = ({ metric, isCurrentStep }: { metric: any, isCurrentStep: boolean }) => {
  const value = metric.completion?.value || 0
  const limit = Number(metric.limit || 1)
  const percentage = Math.min((Number(value) / limit) * 100, 100)
  const isLocked = !isCurrentStep

  return (
    <div className={cn(
      "flex flex-col gap-2 p-2 rounded-lg border bg-background/50 text-xs transition-opacity",
      isLocked ? "opacity-50" : "opacity-100"
    )}>
      <div className="flex justify-between items-center">
        <span className="font-medium">{metric.emoji} {metric.field}</span>
        <span className="text-muted-foreground">{value}/{limit} {metric.unit}</span>
      </div>
      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all" 
          style={{ width: `${percentage}%` }} 
        />
      </div>
    </div>
  )
}

export default ActiveTaskCard