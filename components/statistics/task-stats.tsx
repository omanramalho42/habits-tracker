"use client"

import React, { Fragment, useMemo } from "react"

import UpdateTaskDialog from "@/components/tasks/update-task-dialog"
import DeleteTaskDialog from "@/components/tasks/delete-task-dialog"
import CreateTaskDialog from "@/components/tasks/create-task-dialog"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

import { cn } from "@/lib/utils"

import type { Task } from "@prisma/client"

import {
  MoreVertical,
  Pencil,
  Trash2
} from "lucide-react"

interface TaskStatsProps {
  tasks: Task[]
  isLoading: boolean
}

const TaskStats: React.FC<TaskStatsProps> = ({ tasks, isLoading }) => {

  const stats = useMemo(() => {

    const activeTasks = tasks.filter(t => t.status === "ACTIVE").length

    const latestTask =
      tasks.length > 0
        ? [...tasks].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime()
          )[0]
        : null

    return {
      total: tasks.length,
      active: activeTasks,
      latest: latestTask
    }

  }, [tasks])

  return (
    <div className="flex flex-col gap-6">

      {/* Overall Stats */}
      <div className="grid grid-cols-2 gap-3">

        <div className="bg-primary rounded-xl p-4">

          <div className="flex items-center gap-2 text-primary-foreground/80 mb-1">
            <span className="text-xs">
              Total de Tarefas
            </span>
          </div>

          {isLoading ? (
            <Skeleton className="h-8 w-16 bg-white/40" />
          ) : (
            <p className="text-3xl font-bold text-primary-foreground">
              {stats.total}
            </p>
          )}

          <p className="text-xs text-primary-foreground/70 mt-1">
            cadastradas
          </p>

        </div>

        <div className="bg-card border border-border rounded-xl p-4">

          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <span className="text-xs">
              Ativas
            </span>
          </div>

          {isLoading ? (
            <Skeleton className="h-8 w-12" />
          ) : (
            <p className="text-3xl font-bold">
              {stats.active}
            </p>
          )}

          <p className="text-xs text-muted-foreground mt-1">
            em progresso
          </p>

        </div>

      </div>

      {/* LOADING STATE */}
      {isLoading ? (

        <div className="space-y-4">

          {/* Latest skeleton */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">

            <Skeleton className="h-4 w-40" />

            <div className="flex items-center gap-3">

              <Skeleton className="size-12 rounded-xl" />

              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>

            </div>

          </div>

          {/* List skeleton */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">

            <Skeleton className="h-5 w-32" />

            {Array.from({ length: 3 }).map((_, i) => (

              <div key={i} className="flex items-center gap-3">

                <Skeleton className="size-6 rounded-full" />

                <Skeleton className="size-8 rounded-lg" />

                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>

                <Skeleton className="h-4 w-10" />

                <Skeleton className="size-8 rounded-md" />

              </div>

            ))}

          </div>

        </div>

      ) : tasks.length === 0 ? (

        <CreateTaskDialog
          trigger={
            <Card className="flex flex-row justify-center gap-4 items-center px-4 cursor-pointer">
              <p className="text-sm text-center tracking-tight">
                Adicione uma tarefa e faça a magia acontecer 🪄
              </p>
            </Card>
          }
        />

      ) : (

        <Fragment>

          {/* Latest Task */}
          {stats.latest && (

            <div className="bg-card border border-border rounded-xl p-4">

              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Tarefa Mais Recente
              </h3>

              <div className="flex items-center gap-3">

                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-xl">
                  ✅
                </div>

                <div className="flex-1 min-w-0">

                  <p className="font-medium truncate">
                    {stats.latest.name}
                  </p>

                  {stats.latest.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {stats.latest.description}
                    </p>
                  )}

                  <p className="text-xs text-muted-foreground mt-1">
                    criada em{" "}
                    {new Date(stats.latest.createdAt).toLocaleDateString("pt-BR")}
                  </p>

                </div>

              </div>

            </div>

          )}

          {/* Task List */}
          <div className="bg-card border border-border rounded-xl p-4">

            <h3 className="font-semibold mb-4">
              Lista de Tarefas
            </h3>

            <div className="space-y-3">

              {tasks.map((task, index) => (

                <div key={task.id} className="flex items-center gap-3">

                  <span
                    className={cn(
                      "size-6 rounded-full flex items-center justify-center text-xs font-bold",
                      index === 0 && "bg-yellow-500/20 text-yellow-500",
                      index === 1 && "bg-gray-400/20 text-gray-400",
                      index === 2 && "bg-amber-600/20 text-amber-600",
                      index > 2 && "bg-secondary text-muted-foreground"
                    )}
                  >
                    {index + 1}
                  </span>

                  <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    ✅
                  </div>

                  <div className="flex-1 min-w-0">

                    <p className="text-sm font-medium truncate">
                      {task.name}
                    </p>

                    {task.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {task.description}
                      </p>
                    )}

                  </div>

                  <div className="flex items-center gap-2">

                    <span
                      className={cn(
                        "text-xs font-semibold",
                        task.status === "ACTIVE"
                          ? "text-green-500"
                          : "text-muted-foreground"
                      )}
                    >
                      {task.status}
                    </span>

                    <DropdownMenu>

                      <DropdownMenuTrigger asChild>

                        <Button
                          disabled={isLoading}
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>

                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-44">

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

                      </DropdownMenuContent>

                    </DropdownMenu>

                  </div>

                </div>

              ))}

            </div>

          </div>

        </Fragment>

      )}

    </div>
  )
}

export default TaskStats