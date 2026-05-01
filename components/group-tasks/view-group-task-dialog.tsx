"use client"

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { 
  Layers3, 
  Loader2, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Circle 
} from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import ActiveTaskCard from '../tasks/active-task-card'

interface ViewGroupTaskDialogProps {
  groupId: string
  trigger?: React.ReactNode
  selectedDate?: Date
}

export function ViewGroupTaskDialog({ 
  groupId, 
  trigger, 
  selectedDate 
}: ViewGroupTaskDialogProps) {
  const [open, setOpen] = useState<boolean>(false)
  const { data: group, isLoading, error } = useQuery({
    queryKey: ["group-tasks", groupId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/group-tasks/${groupId}`)
      return data
    },
    enabled: !!groupId, // Só busca se houver ID
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <div className="cursor-pointer">Clique para ver detalhes</div>
        )}
      </DialogTrigger>

      <DialogContent
        className="w-[95vw] scroll-container max-w-lg sm:max-w-2xl max-h-[90vh] overflow-y-auto"
        onPointerDownCapture={(e) => e.stopPropagation()}
      >
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="p-6 text-center text-destructive">
            Erro ao carregar detalhes do grupo.
          </div>
        ) : (
          <>
            <DialogHeader className="p-6 pb-2">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200 gap-1">
                  <Layers3 className="h-3 w-3" /> Grupo
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3" />
                  {group.tasks?.length || 0} Tarefas
                </span>
              </div>
              <DialogTitle className="text-2xl font-bold">{group.name}</DialogTitle>
              {group.description && (
                <DialogDescription className="text-base pt-2">
                  {group.description}
                </DialogDescription>
              )}
            </DialogHeader>

            <Separator />

            <div className="flex-1 overflow-hidden p-6">
              <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                Tarefas vinculadas
              </h4>
              
              <ScrollArea className="h-100 pr-4">
                <div className="flex flex-col gap-3">
                  {group.tasks && group.tasks.length > 0 ? (
                    group.tasks.map((task: any) => (
                      <ActiveTaskCard 
                        key={task.id} 
                        task={task} 
                        selectedDate={selectedDate} 
                      />
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground border rounded-lg border-dashed">
                      <Circle className="h-8 w-8 mb-2 opacity-20" />
                      <p className="text-sm">Nenhuma tarefa neste grupo ainda.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}