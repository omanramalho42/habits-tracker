
import { Card } from '@/components/ui/card'

import type {
  Categories,
  Counter,
  Goals,
  Task,
  TaskCompletion,
  TaskMetric
} from '@prisma/client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import axios from 'axios'

import confetti from "canvas-confetti"

import CreateAnnotationDialog from '@/components/annotations/create-annotation-dialog'
import DeleteTaskDialog from '@/components/tasks/delete-task-dialog'
import UpdateTaskDialog from '@/components/tasks/update-task-dialog'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

import { cn } from '@/lib/utils'

import {
  Check,
  File,
  Image,
  MoreVertical,
  Pencil,
  Trash2,
  Video
} from 'lucide-react'
import MediaPreview from '../midia-preview'

interface ActiveTaskCardProps {
  task: Task & {
    completions?: (TaskCompletion & { taskMetric?: TaskMetric[] })[],
    goals?: Goals[],
    categories?: Categories[],
    counter?: (Counter & { taskMetric?: TaskMetric[] }),
  }
  selectedDate?: Date
}

const ActiveTaskCard = ({ task, selectedDate }: ActiveTaskCardProps) => {
  const completionId = 
    task?.completions?.find((c) => 
      c.completedDate === selectedDate && c.id
    || null
  )

  const queryClient = useQueryClient()
  const { mutate, data, isPending } = useMutation({
    mutationFn: async ({
      taskId,
      date
    }: {
      taskId: string
      date: string
    }) => {
      const response =
        await axios.put(`/api/task/${taskId}`, {
          date,
        })
      return response.data
    },
    onSuccess: async (values) => {
      await queryClient.invalidateQueries({
        queryKey: ["tasks"],
      })
      await queryClient.invalidateQueries({
        queryKey: ["routines"],
      })

      if(values.completed) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#3B82F6", "#8B5CF6", "#06B6D4", "#10B981"],
        })
      }

      toast.success(
        "Sucesso ao alterar o status da tarefa...",
        { id: 'toggle-task' }
      )
    },
    onError: (error: any) => {
      toast.error(error?.message || "Erro ao alterar status do hábito", {
        id: "toggle-task",
      })
    },
  })

  const handleToggleTask = (taskId: string, date: Date) => {
    toast.loading(
      "Alterando status da terafa...", {
        id: `toggle-task`,
    })
    // date.setHours(0,0,0,0)
    mutate({
      taskId,
      date: date.toISOString(),
    })
  }

  console.log(task, "task!");

  return (
    <Card className='flex flex-row justify-between items-center px-2'>
      <div className="flex flex-row gap-2 tracking-tight truncate">
        <p className='text-sm'>
          {task.emoji}
        </p>
        <p className='text-sm truncate tracking-tight'>
          {task.name}
        </p>
      </div>

      <div className='flex flex-col gap-2'>
        {task.goals && task.goals.length > 0 && (
          <p className="text-[10px] text-muted-foreground truncate max-w-25 tracking-tight">
            {task.goals.map((g) => g.emoji + " " + g.name).join(", ")}
          </p>
        )}
        {task.categories && task.categories.length > 0 && (
          <p className="text-[10px] text-muted-foreground truncate max-w-25 tracking-tight">
            {task.categories.map((c) => c.emoji + " " + c.name).join(", ")}
          </p>
        )}
      </div>

      {task.counter && task.counter.limit > 1 && (
        <div className="flex flex-col gap-2">
          <div className='flex flex-row items-center gap-2'>
            <p className='text-[10px] text-muted-foreground truncate max-w-25 tracking-tight'>
              {task.counter.emoji}
            </p>
            <p className='text-[10px] text-muted-foreground truncate max-w-25 tracking-tight'>
              {task.counter.label}
            </p>
            <p className='text-[10px] text-muted-foreground truncate max-w-25 tracking-tight'>
              {task.counter.limit}
            </p>
          </div>
          {task.counter?.taskMetric?.map((metric) => {
            return (
              <div
                key={metric.id}
                className='flex flex-row items-center gap-3 justify-between'
              >
                <p className="text-[10px] text-muted-foreground truncate max-w-25 tracking-tight">
                  {metric.emoji}
                </p>
                <p className="text-[10px] text-muted-foreground truncate max-w-25 tracking-tight">
                  {metric.field}
                </p>
                <p className="text-[10px] text-muted-foreground truncate max-w-25 tracking-tight">
                  {metric.value}
                </p>
              </div>
            )
          })}
        </div>
      )}
      
      <MediaPreview
        imageUrl={task.imageUrl}
        videoUrl={task.videoUrl}
      />
    
      <div
        className={cn(
          "flex justify-center items-center gap-1 transition-opacity",
          // "opacity-100 md:opacity-0 md:group-hover:opacity-100",
        )}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              disabled={isPending}
              variant="ghost"
              size="icon"
              className="h-8 w-8"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            {/* EDIT */}
            <UpdateTaskDialog
              task={task}
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
            <DeleteTaskDialog
              taskId={task.id}
              trigger={
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              }
            />

            {/* <TaskDetailDialog
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
            />  */}
            {/* ANNOTATION */}
            {completionId && (
              <CreateAnnotationDialog
                completionId={completionId.id}
                trigger={
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    // disabled={loading}
                  >
                    <File className="mr-2 h-4 w-4" />
                    Anotação
                  </DropdownMenuItem>
                }
                
              />
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          className='p-4 rounded-full'
          size="icon"
          variant="outline"
          type='button'
          onClick={() => handleToggleTask(task.id, selectedDate || new Date())}
        >
          {task.completions?.some((c) => 
            String(c.completedDate).split("T")[0].slice(0,10) ===
            new Date().toISOString().split("T")[0].slice(0,10)
          ) && (
            <Check className='w-2 h-2' />
          )}
        </Button>
      </div>
    </Card>
  )
}

export default ActiveTaskCard

