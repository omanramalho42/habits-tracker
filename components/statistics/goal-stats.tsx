"use client"

import React, { Fragment, useMemo } from "react"

import UpdateGoalDialog from "@/components/goals/update.goal-dialog"
import DeleteGoalDialog from "@/components/goals/delete-goal-dialog"
import CreateGoalDialog from "@/components/goals/create-goal-dialog"

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

import type {
  CheckPoint,
  Goals,
  Habit,
  Task
} from "@prisma/client"

import {
  MoreVertical,
  Pencil,
  Trash2
} from "lucide-react"

interface GoalStatsProps {
  isLoading: boolean
  goals: (Goals & {
    habits?: Habit[]
    checkpoints?: CheckPoint[]
    tasks?: Task[]
  })[]
}

const GoalStats: React.FC<GoalStatsProps> = ({
  goals,
  isLoading
}) => {

  const stats = useMemo(() => {

    const active = goals.filter(g => g.status === "ACTIVE").length
    const withHabits = goals.filter(g => g.habits?.length).length
    const withCheckpoints = goals.filter(g => g.checkpoints?.length).length

    const latest =
      goals.length > 0
        ? [...goals].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime()
          )[0]
        : null

    return {
      total: goals.length,
      active,
      withHabits,
      withCheckpoints,
      latest
    }

  }, [goals])

  return (
    <div className="flex flex-col gap-6">

      {/* Overall Stats */}
      <div className="grid grid-cols-2 gap-3">

        <div className="bg-primary rounded-xl p-4">

          <span className="text-xs text-primary-foreground/80">
            Total de Objetivos
          </span>

          {isLoading ? (
            <Skeleton className="h-8 w-16 bg-white/40 mt-1" />
          ) : (
            <p className="text-3xl font-bold text-primary-foreground">
              {stats.total}
            </p>
          )}

          <p className="text-xs text-primary-foreground/70 mt-1">
            cadastrados
          </p>

        </div>

        <div className="bg-card border border-border rounded-xl p-4">

          <span className="text-xs text-muted-foreground">
            Ativos
          </span>

          {isLoading ? (
            <Skeleton className="h-8 w-12 mt-1" />
          ) : (
            <p className="text-3xl font-bold">
              {stats.active}
            </p>
          )}

          <p className="text-xs text-muted-foreground mt-1">
            em progresso
          </p>

        </div>

        <div className="bg-card border border-border rounded-xl p-4">

          <span className="text-xs text-muted-foreground">
            Com Hábitos
          </span>

          {isLoading ? (
            <Skeleton className="h-8 w-12 mt-1" />
          ) : (
            <p className="text-3xl font-bold">
              {stats.withHabits}
            </p>
          )}

          <p className="text-xs text-muted-foreground mt-1">
            vinculados a hábitos
          </p>

        </div>

        <div className="bg-card border border-border rounded-xl p-4">

          <span className="text-xs text-muted-foreground">
            Com Checkpoints
          </span>

          {isLoading ? (
            <Skeleton className="h-8 w-12 mt-1" />
          ) : (
            <p className="text-3xl font-bold">
              {stats.withCheckpoints}
            </p>
          )}

          <p className="text-xs text-muted-foreground mt-1">
            possuem marcos
          </p>

        </div>

      </div>

      {isLoading ? (

        <div className="space-y-4">

          {/* Latest goal skeleton */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">

            <Skeleton className="h-4 w-40" />

            <div className="flex items-center gap-3">

              <Skeleton className="size-12 rounded-xl" />

              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>

            </div>

          </div>

          {/* Goal list skeleton */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">

            <Skeleton className="h-5 w-40" />

            {Array.from({ length: 3 }).map((_, i) => (

              <div key={i} className="flex items-center gap-3">

                <Skeleton className="size-6 rounded-full" />

                <Skeleton className="size-8 rounded-lg" />

                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>

                <Skeleton className="h-4 w-16" />

                <Skeleton className="size-8 rounded-md" />

              </div>

            ))}

          </div>

        </div>

      ) : goals.length === 0 ? (

        <CreateGoalDialog
          trigger={
            <Card className="flex flex-row justify-center gap-4 items-center px-4 cursor-pointer">
              <p className="text-sm text-center tracking-tight">
                Adicione objetivos e faça a magia acontecer 🪄
              </p>
            </Card>
          }
        />

      ) : (

        <Fragment>

          {/* Latest Goal */}
          {stats.latest && (

            <div className="bg-card border border-border rounded-xl p-4">

              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Objetivo Mais Recente
              </h3>

              <div className="flex items-center gap-3">

                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-xl">
                  {stats.latest.emoji || "🎯"}
                </div>

                <div className="flex-1">

                  <p className="font-medium">
                    {stats.latest.name}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    criado em{" "}
                    {new Date(stats.latest.createdAt).toLocaleDateString("pt-BR")}
                  </p>

                </div>

              </div>

            </div>

          )}

          {/* Goal List */}
          <div className="bg-card border border-border rounded-xl p-4">

            <h3 className="font-semibold mb-4">
              Lista de Objetivos
            </h3>

            <div className="space-y-3">

              {goals.map((goal, index) => (

                <div key={goal.id} className="flex items-center gap-3">

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

                  <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-lg">
                    {goal.emoji || "🎯"}
                  </div>

                  <div className="flex-1 min-w-0">

                    <p className="text-sm font-medium truncate">
                      {goal.name}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {goal.habits?.length || 0} hábitos • {goal.tasks?.length || 0} tarefas
                    </p>

                  </div>

                  <span
                    className={cn(
                      "text-xs font-semibold",
                      goal.status === "ACTIVE"
                        ? "text-green-500"
                        : "text-muted-foreground"
                    )}
                  >
                    {goal.status}
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

                      <UpdateGoalDialog
                        goal={goal}
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

                      <DeleteGoalDialog
                        goalId={goal.id}
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

              ))}

            </div>

          </div>

        </Fragment>

      )}

    </div>
  )
}

export default GoalStats