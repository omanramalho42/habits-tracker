"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

import {
  Check,
  Eye,
  File,
  MoreVertical,
  Pencil,
  PencilIcon,
  Trash2
} from "lucide-react"

import { cn } from "@/lib/utils"
import MediaPreview from "../midia-preview"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import axios from "axios"
import confetti from "canvas-confetti"

import CreateAnnotationDialog from "@/components/annotations/create-annotation-dialog"
import DeleteTaskDialog from "@/components/tasks/delete-task-dialog"
import UpdateTaskDialog from "@/components/tasks/update-task-dialog"
import UpdateCounterDialog from "../counter/update-counter-dialog"
import { TaskDetailsDialog } from "./task-detail-dialog"

interface ActiveTaskCardProps {
  task: any
  selectedDate?: Date
}

const ActiveTaskCard = ({ task, selectedDate }: ActiveTaskCardProps) => {

  const queryClient = useQueryClient()

  const completion = task?.completions?.find(
    (c: any) =>
      new Date(c.completedDate).toDateString() ===
      new Date(selectedDate || new Date()).toDateString()
  )

  const { mutate, isPending } = useMutation({
    mutationFn: async ({ taskId, date }: any) => {
      const res = await axios.put(`/api/task/${taskId}`, { date })
      return res.data
    },
    onSuccess: async (res) => {
      await queryClient.invalidateQueries({ queryKey: ["tasks"] })

      if (res.completed) {
        confetti({
          particleCount: 80,
          spread: 60,
        })
      }

      toast.success("Status atualizado")
    },
    onError: () => {
      toast.error("Erro ao atualizar tarefa")
    }
  })

  const handleToggle = () => {
    console.log(selectedDate, "selected Date");

    mutate({
      taskId: task.id,
      date: (selectedDate || new Date()).toISOString()
    })
  }
  console.log(task, "task")
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
            variant={completion ? "default" : "outline"}
            onClick={handleToggle}
            disabled={isPending}
            className="rounded-full"
          >
            <Check className={cn("w-4 h-4", completion ? "visible" : "hidden")} />
          </Button>

        </div>
      </div>

      {/* META INFO */}
      {(task.goals?.length > 0 || task.categories?.length > 0) && (
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

          <div className="flex items-center gap-2 text-xs">
            <span>{task.counter.emoji}</span>
            <span className="font-medium">{task.counter.label}</span>
            
            <span className="text-muted-foreground">
              {task.counter.limit}x
            </span>
            <UpdateCounterDialog
              counter={task.counter}
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

          {/* METRICS */}
          {task.counter.taskMetric?.length > 0 && (
            <div className="grid grid-cols-2 gap-2 text-xs">

              {task.counter.taskMetric.map((metric: any) => (
                <div
                  key={metric.id}
                  className="flex justify-between bg-background rounded px-2 py-1"
                >
                  <span className="truncate">
                    {metric.emoji} {metric.field}
                  </span>
                  <div className="flex flex-row gap-2 items-center">
                    <span className="font-medium">
                      {metric.value}
                    </span>
                    <span className="font-bold">
                      {metric?.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

    </Card>
  )
}

export default ActiveTaskCard