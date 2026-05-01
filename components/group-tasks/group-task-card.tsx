"use client"

import React from 'react'
import { Layers3, ChevronRight, Pencil, Trash2, EyeIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DeleteGroupTaskDialog } from './delete-group-task-dialog' // Ajuste o path
import UpdateGroupTaskDialog from './update-group-task-dialog'
import { GroupTask, Task } from '@prisma/client'
import { ViewGroupTaskDialog } from './view-group-task-dialog'

export const GroupTaskCard = ({ group }: { group: GroupTask & { tasks: Task[]; _count: any }}) => {
  // Define uma cor padrão caso group.color seja undefined
  const groupColor = group.color || "#8B5CF6"
  return (
    <Card 
      className="p-4 border-l-4 hover:bg-accent/50 transition-colors cursor-pointer group relative"
      style={{ borderLeftColor: groupColor }} // Cor dinâmica da borda
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
            <Layers3 className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground leading-none">{group.name}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {/* Total de Tarefas */}
              {group._count?.tasks || 0} tarefas vinculadas | 
              
              {/* Total de Conclusões somadas de todas as tarefas */}
              <span className="ml-1 text-emerald-600 font-medium">
                {group.tasks?.reduce((total: number, task: any) => 
                  total + (task.completions?.length || 0), 0
                ) || 0} concluídas
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Ações: Visíveis por padrão no mobile e hover no desktop */}
          <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity mr-2">
            
            <UpdateGroupTaskDialog 
              group={group}
              trigger={
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              }
            />

            <ViewGroupTaskDialog 
              key={group.id} 
              groupId={group.id}
              trigger={
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                >
                  <EyeIcon className="h-4 w-4" />
                </Button>
              }
            />

            <DeleteGroupTaskDialog 
              groupId={group.id}
              groupName={group.name}
              trigger={
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={(e) => e.stopPropagation()} // Importante!
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              }
            />
          </div>
          
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Card>
  )
}