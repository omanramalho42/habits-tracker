"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import axios from "axios"
import confetti from "canvas-confetti"
import { useState, useMemo } from "react"

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

import { cn, formatToBrazilDay, parseLocaleNumber } from "@/lib/utils"
import {
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  File,
  Files,
  MoreVertical,
  Pencil,
  PencilIcon,
  Trash2,
  BarChart3
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

import PutTaskMetrics from "../task-metrics/put-task-metrics"
import { StreakCelebration } from "../v2/streak-celebration"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible"
import { MetricChart } from "./metric-chart"

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
  const [openMetricsDialog, setOpenMetricsDialog] = useState<boolean>(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showStreak, setShowStreak] = useState(false)
  const [showChart, setShowChart] = useState(true) // Novo estado para o gráfico

  const queryClient = useQueryClient()

  const formatter = useMemo(() => new Intl.DateTimeFormat("pt-BR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }), [])

  const selected = formatter.format(new Date(selectedDate || new Date()))
  
  const completion = task?.completions?.find((c: any) =>
    formatToBrazilDay(c.completedDate) === formatToBrazilDay(selectedDate || new Date())
  )

  const counterDay = task?.counter?.CounterStep?.find(
    (c: CounterStep) => formatter.format(new Date(c.date)) === selected
  )
  
  const hasCompletion = task.completions?.some((completion) => {
    if (!completion.completedDate) return false;
    return formatter.format(new Date(completion.completedDate)) === selected;
  });

  const currentStep = hasCompletion ? (task.limitCounter || 0) : 0
  const limit = Number(counterDay?.limit ?? task?.counter?.limit ?? 1)

  const allStepsMetrics = useMemo(() => {
    if (!task.metrics || !task.counter) return []
    
    return task.metrics.map(metric => {
      // Soma o que foi realizado em todos os steps
      const totalValue = metric.taskMetricCompletion?.reduce((acc, curr) => {
        return acc + parseLocaleNumber(curr.value)
      }, 0) || 0

      // Multiplica a meta individual pelo limite do contador (ex: 500ml * 4 steps = 2000ml)
      const totalLimit = parseLocaleNumber(metric.limit) * (task.counter?.limit || 1)

      return {
        ...metric,
        limit: totalLimit.toString(), // Atualiza o limite para o total acumulado
        completion: { value: totalValue.toString() },
        isGlobal: true 
      }
    })
  }, [task.metrics, task.counter])

  const { mutate, isPending } = useMutation({
    mutationFn: async ({ taskId, date }: any) => {
      const res = await axios.put(`/api/task/${taskId}`, { date })
      return res.data
    },
    onSuccess: async (values) => {
      toast.success("Status atualizado")
      await queryClient.invalidateQueries({ queryKey: ["tasks"] })
      if (values.isCompleted) {
        setShowStreak(true)
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
      }
      if(values.step < values.limit) setOpenMetricsDialog(true)
    }
  })

  const handleToggle = (taskId: string) => {
    mutate({ taskId, date: (selectedDate || new Date()).toISOString() })
  }

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded} className="w-full">
      <Card className={cn("p-3 flex flex-col gap-3 transition-all", isExpanded && "ring-1 ring-primary/20")}>
        {/* HEADER */}
        <div className="flex items-center justify-between gap-2">
          <CollapsibleTrigger asChild>
            <div className="flex items-center gap-2 min-w-0 cursor-pointer flex-1 group">
              <span className="text-lg">{task.emoji}</span>
              <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                {task.name}
              </p>
              {task.metrics && task.metrics.length > 0 && (
                isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
              )}
            </div>
          </CollapsibleTrigger>

          <div className="flex items-center gap-1">
            <MediaPreview imageUrl={task.imageUrl} videoUrl={task.videoUrl} />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost"><MoreVertical className="w-4 h-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <UpdateTaskDialog task={task} trigger={<DropdownMenuItem onSelect={(e) => e.preventDefault()}><Pencil className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>} />
                <DropdownMenuSeparator />
                <DeleteTaskDialog taskId={task.id} trigger={<DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Excluir</DropdownMenuItem>} />
                {completion && <CreateAnnotationDialog completionId={completion.id} trigger={<DropdownMenuItem><File className="mr-2 h-4 w-4" />Anotação</DropdownMenuItem>} />}
                <TaskDetailsDialog task={task} trigger={<DropdownMenuItem><Eye className="mr-2 h-4 w-4" />Detalhes</DropdownMenuItem>} />
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              size="icon"
              variant={completion?.isCompleted ? "default" : "outline"}
              onClick={(e) => { e.stopPropagation(); handleToggle(task.id) }}
              disabled={isPending || (currentStep < limit && limit !== 1)}
              className="rounded-full"
            >
              <Check className={cn("w-4 h-4", completion?.isCompleted ? "visible" : "hidden")} />
            </Button>
          </div>
        </div>

        {/* DROPDOWN CONTENT */}
        <CollapsibleContent className="space-y-3 animate-in fade-in slide-in-from-top-1">
          <div className="h-px bg-border w-full my-1" />
          
          {task.counter && (
            <div className="flex flex-col gap-2 border rounded-lg p-2 bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{task.counter.emoji}</span>
                  <span className="font-medium">{task.counter.label}</span>
                  <span className="text-muted-foreground text-xs">{currentStep}|{limit}</span>
                  <UpdateCounterDialog counter={task.counter} metrics={task.metrics} taskId={task.id} selectedDate={selectedDate || new Date()} trigger={<Button variant="outline" size="sm" className="h-7 w-7 p-0"><PencilIcon className="w-3 h-3" /></Button>} />
                </div>
                
                <div className="flex items-center gap-1">
                   {/* Botão de Esconder/Mostrar Gráfico */}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-0"
                    onClick={() => setShowChart(!showChart)}
                    title={showChart ? "Esconder Gráfico" : "Mostrar Gráfico"}
                  >
                    {showChart ? <BarChart3 className="w-3 h-3 text-primary" /> : <EyeOff className="w-3 h-3 text-muted-foreground" />}
                  </Button>

                  <PutTaskMetrics 
                    open={openMetricsDialog} 
                    onOpenChange={setOpenMetricsDialog} 
                    metrics={task.metrics || []} 
                    selectedDate={selectedDate} 
                    taskId={task.id} 
                    index={currentStep + 1} 
                    counterId={task.counter.id} 
                    trigger={<Button variant="ghost" size="sm" className="h-7 w-7 p-0" disabled={currentStep >= limit}><Files className="w-3 h-3" /></Button>} 
                  />
                </div>
              </div>

              {task?.metrics && task.metrics.length > 0 && (
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="flex w-full overflow-x-auto justify-start h-9 bg-transparent border-b rounded-none p-0 mb-2">
                    <TabsTrigger value="all" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                      Geral
                    </TabsTrigger>
                    {Array.from({ length: limit }).map((_, i) => (
                      <TabsTrigger key={i} value={String(i + 1)} className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                        {i + 1}º {task.counter?.label || "Step"}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  <TabsContent value="all" className="mt-0 space-y-3">
                    <div className="grid grid-cols-1 gap-2">
                      {allStepsMetrics.map((metric) => (
                        <MetricItem key={metric.id} metric={metric} isCurrentStep={true} />
                      ))}
                    </div>
                    {showChart && <MetricChart metrics={allStepsMetrics} taskColor={task?.color || ""} counterLabel="Total Acumulado" step={0} />}
                  </TabsContent>

                  {Array.from({ length: limit }).map((_, i) => {
                    const step = i + 1
                    const metricsWithCompletion = task.metrics?.map((m) => ({
                      ...m,
                      completion: m.taskMetricCompletion?.find((c) => c.step === step)
                    }))

                    return (
                      <TabsContent key={step} value={String(step)} className="mt-0 space-y-3">
                        <div className="grid grid-cols-1 gap-2">
                          {metricsWithCompletion?.map((metric) => (
                            <MetricItem key={metric.id} metric={metric} isCurrentStep={step === (currentStep + 1)} />
                          ))}
                        </div>
                        {showChart && metricsWithCompletion && (
                          <MetricChart metrics={metricsWithCompletion} taskColor={task?.color || ""} counterLabel={task?.counter?.label} step={step} />
                        )}
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

const MetricItem = ({ metric, isCurrentStep }: { metric: any, isCurrentStep: boolean }) => {
  const valueNumber = parseLocaleNumber(metric.completion?.value);
  const limitNumber = parseLocaleNumber(metric.limit);
  const percentage = limitNumber > 0 ? Math.min((valueNumber / limitNumber) * 100, 100) : 0;

  return (
    <div className={cn(
      "flex flex-col gap-2 p-2 rounded-lg border bg-background/50 text-xs transition-opacity",
      !isCurrentStep && !metric.isGlobal ? "opacity-50" : "opacity-100"
    )}>
      <div className="flex justify-between items-center">
        <span className="font-medium">{metric.emoji} {metric.field}</span>
        <span className="text-muted-foreground">{metric.completion?.value || 0}/{metric.limit} {metric.unit}</span>
      </div>
      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary transition-all" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}

export default ActiveTaskCard