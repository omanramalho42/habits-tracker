
import { Card } from '@/components/ui/card'

import type {
  Categories,
  Goals,
  Task,
  TaskCompletion
} from '@prisma/client'

import CreateAnnotationDialog from '@/components/create-annotation-dialog'
import DeleteTaskDialog from '@/components/tasks/delete-task-dialog'
import UpdateTaskDialog from '@/components/tasks/update-task-dialog'

import { Button } from '@/components/ui/button'
import {
  Check,
  File,
  MoreVertical,
  Pencil,
  Trash2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

interface ActiveTaskCardProps {
  task: Task & {
    completions?: TaskCompletion[],
    goals?: Goals[],
    categories?: Categories[]
  }
  selectedDate?: Date
}

const ActiveTaskCard = ({ task, selectedDate }: ActiveTaskCardProps) => {
  const completionId = 
    task?.completions?.find((c) => 
      c.completedDate === selectedDate && c.id
    || null
  )

  return (
    <Card className='flex flex-row justify-between items-center px-2'>
      <div className="flex flex-row gap-2 max-w-[50%]">
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
      
      <div
        className={cn(
          "flex justify-center items-center gap-1 transition-opacity",
          // "opacity-100 md:opacity-0 md:group-hover:opacity-100",
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
        >
          <Check className='w-2 h-2' />
        </Button>
      </div>
    
      
    </Card>
  )
}

export default ActiveTaskCard