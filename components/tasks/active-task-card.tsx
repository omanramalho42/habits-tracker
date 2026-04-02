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

import { cn } from "@/lib/utils"
import {
  Check,
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
  CounterAux,
  Goals,
  Task,
  TaskCompletion,
  TaskMetric,
  TaskMetricCompletion
} from "@prisma/client"
import { useState } from "react"

import PutTaskMetrics from "../task-metrics/put-task-metrics"

interface ActiveTaskCardProps {
  task: (Task & {
    metricCompletions?: TaskMetricCompletion[],
    completions?: TaskCompletion[]
    goals?: Goals[],
    categories?: Categories[]
    counter?: Counter & {
      CounterAux: CounterAux[],
      taskMetric?: (TaskMetric & {
        completion?: TaskMetricCompletion[]
      })[]
    }
  })
  selectedDate?: Date
}

const ActiveTaskCard = ({ task, selectedDate }: ActiveTaskCardProps) => {
  const [openMetricsDialog, setOpenMetricsDialog] =
    useState<boolean>(false)

  const queryClient = useQueryClient()

  const completion = task?.completions?.find(
    (c: any) =>
      new Date(c.completedDate).toDateString() ===
      new Date(selectedDate || new Date()).toDateString()
  )

  const formatter = new Intl.DateTimeFormat("pt-BR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })

  const selected = formatter.format(new Date(selectedDate || new Date()))

  const counterDay = task?.counter?.CounterAux?.find(
    (c: CounterAux) =>
      formatter.format(new Date(c.date)) === selected
  )

  const currentStep = Number(counterDay?.currentStep ?? 0)
  const limit = Number(counterDay?.limit ?? task?.counter?.limit ?? 1)

  const { mutate, isPending } = useMutation({
    mutationFn: async ({ taskId, date }: any) => {
      toast.success("Atualizando status da tarefa", {
        id: "toggle-task"
      })
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
        queryKey: ["tasks", selectedDate],
      })
      await queryClient.invalidateQueries({
        queryKey: ["routines", selectedDate],
      })
      if(values.step < values.limit) {
        setOpenMetricsDialog(true)
      }
      if (!values.completion.isCompleted) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#3B82F6", "#8B5CF6", "#06B6D4", "#10B981"],
        })
      }
    },
    onError: (error) => {
      toast.error(error?.message || "Erro ao alterar status do hábito", {
        id: "toggle-task",
      })
    }
  })

  const handleToggle = () => {
    console.log(selectedDate, "selected Date");

    mutate({
      taskId: task.id,
      date: (selectedDate || new Date()).toISOString()
    })
  }

  console.log(task, 'task!')
 
  return (
    <Card className="p-3 flex flex-col gap-3">

      {/* HEADER */}
      <div className="flex items-center justify-between gap-2">

        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg">{task.emoji}</span>

          <p className="text-sm font-medium truncate">
            {task.name}
          </p>
        </div>

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
            onClick={handleToggle}
            disabled={isPending || currentStep >= limit}
            className="rounded-full"
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
              open={task?.counter?.taskMetric && task?.counter?.taskMetric?.length > 0 ? openMetricsDialog : false}
              onOpenChange={setOpenMetricsDialog}
              taskMetric={task.counter.taskMetric || []}
              disabled={(Number(task.counter.valueNumber) - 1) === task.counter.limit}
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
              <Check className={cn("w-4 h-4", task.counter.valueNumber === task.counter.limit ? "visible" : "hidden")} />
            </Button>
          </div>
          
          {/* taskMetric com steps */}
          {task.counter?.taskMetric && task.counter?.taskMetric?.length > 0 && (
            <Tabs
              defaultValue={String(currentStep || 1)}
              className="w-full"
            >
              {/* 🔥 TABS HEADER */}
              <TabsList className="grid w-full grid-cols-3">
                {Array.from({ length: currentStep }).map((_, i) => {
                  const step = String(i + 1)

                  return (
                    <TabsTrigger key={step} value={step}>
                      {`${step} ${task.counter?.label.slice(
                        0,
                        task.counter.label.length - 1
                      )}`}
                    </TabsTrigger>
                  )
                })}
              </TabsList>

              {/* 🔥 TABS CONTENT */}
              {Array.from({ length: task.counter.limit }).map((_, i) => {
                const step = i + 1
                const isCurrentStep = step === currentStep

                // 🔥 AGORA USANDO COMPLETIONS
                const metrics = task?.counter?.taskMetric?.map((metric: any) => {
                  const completion = metric.taskMetricCompletion?.find(
                    (c: any) => c.index === step
                  )

                  return {
                    ...metric,
                    completion,
                  }
                })

                return (
                  <TabsContent key={step} value={String(step)}>
                    <div className="grid grid-cols-1 gap-3 mt-3">
                      {metrics?.length === 0 && (
                        <div className="text-xs text-muted-foreground text-center py-4">
                          Nenhuma métrica neste step
                        </div>
                      )}

                      {metrics?.map((metric: any) => {
                        const completion = metric.completion

                        const value = Number(completion?.value || 0)
                        const limit = Number(metric.limit || 1)

                        const percentage = Math.min((value / limit) * 100, 100)

                        const color =
                          percentage >= 100
                            ? "bg-green-500"
                            : percentage >= 60
                            ? "bg-yellow-500"
                            : "bg-primary"

                        const isLocked = !isCurrentStep

                        return (
                          <div
                            key={metric.id}
                            className={`flex flex-col gap-2 p-3 rounded-xl border bg-card shadow-sm transition-all ${
                              isLocked ? "opacity-60" : "hover:shadow-md"
                            }`}
                          >
                            {/* HEADER */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-base">{metric.emoji}</span>
                                <span className="text-sm font-semibold">
                                  {metric.field}
                                </span>
                              </div>

                              <span className="text-xs font-medium text-muted-foreground">
                                {value}/{limit} {metric.unit}
                              </span>
                            </div>

                            {/* PROGRESS */}
                            <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full ${color} transition-all duration-300`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>

                            {/* FOOTER */}
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-muted-foreground">
                                {Math.round(percentage)}%
                              </span>

                              <div className="flex items-center gap-2">
                                {completion?.isComplete && (
                                  <span className="text-green-500 font-semibold">
                                    ✔ Completo
                                  </span>
                                )}

                                {/* 🔥 ÍCONE NO LUGAR DO BOTÃO */}
                                {!completion?.isComplete && isCurrentStep && (
                                  <Button
                                    size="icon"
                                    variant={completion?.isComplete ? "default" : "outline"}
                                    onClick={() => handleToggle()}
                                    disabled={isPending}
                                    className="rounded-full"
                                > 
                                  <Check className={cn("w-4 h-4", completion?.isComplete ? "visible" : "hidden")} />
                                </Button>
                                )}

                                {/* 🔒 BLOQUEADO */}
                                {isLocked && (
                                  <span className="text-muted-foreground text-xs">
                                    🔒
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </TabsContent>
                )
              })}
            </Tabs>
          )}

        </div>
      )}

    </Card>
  )
}

export default ActiveTaskCard