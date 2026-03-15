"use client"

import React, { Fragment, useMemo } from "react"

import UpdateRoutineDialog from "@/components/update-routine-dialog"
import DeleteRoutineDialog from "@/components/delete-routine-dialog"
import CreateRoutineDialog from "@/components/create-routine-dialog"

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

import type { Routine } from "@prisma/client"

import {
  MoreVertical,
  Pencil,
  Trash2
} from "lucide-react"

interface RoutineStatsProps {
  routines: Routine[]
  isLoading: boolean
}

const RoutineStats: React.FC<RoutineStatsProps> = ({
  routines,
  isLoading
}) => {

  const stats = useMemo(() => {

    const active = routines.filter(r => r.status === "ACTIVE").length
    const withEndDate = routines.filter(r => r.endDate).length
    const withoutEndDate = routines.filter(r => !r.endDate).length

    const latest =
      routines.length > 0
        ? [...routines].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime()
          )[0]
        : null

    return {
      total: routines.length,
      active,
      withEndDate,
      withoutEndDate,
      latest
    }

  }, [routines])

  return (
    <div className="flex flex-col gap-6">

      {/* Overall Stats */}
      <div className="grid grid-cols-2 gap-3">

        <div className="bg-primary rounded-xl p-4">

          <div className="flex items-center gap-2 text-primary-foreground/80 mb-1">
            <span className="text-xs">
              Rotinas Ativas
            </span>
          </div>

          {isLoading ? (
            <Skeleton className="h-8 w-16 bg-white/40" />
          ) : (
            <p className="text-3xl font-bold text-primary-foreground">
              {stats.active}
            </p>
          )}

          <p className="text-xs text-primary-foreground/70 mt-1">
            atualmente ativas
          </p>

        </div>

        <div className="bg-card border border-border rounded-xl p-4">

          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <span className="text-xs">
              Total de Rotinas
            </span>
          </div>

          {isLoading ? (
            <Skeleton className="h-8 w-12" />
          ) : (
            <p className="text-3xl font-bold">
              {stats.total}
            </p>
          )}

          <p className="text-xs text-muted-foreground mt-1">
            cadastradas
          </p>

        </div>

        <div className="bg-card border border-border rounded-xl p-4">

          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <span className="text-xs">
              Com Data Final
            </span>
          </div>

          {isLoading ? (
            <Skeleton className="h-8 w-12" />
          ) : (
            <p className="text-3xl font-bold">
              {stats.withEndDate}
            </p>
          )}

          <p className="text-xs text-muted-foreground mt-1">
            possuem prazo
          </p>

        </div>

        <div className="bg-card border border-border rounded-xl p-4">

          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <span className="text-xs">
              Sem Prazo
            </span>
          </div>

          {isLoading ? (
            <Skeleton className="h-8 w-12" />
          ) : (
            <p className="text-3xl font-bold">
              {stats.withoutEndDate}
            </p>
          )}

          <p className="text-xs text-muted-foreground mt-1">
            contínuas
          </p>

        </div>

      </div>

      {/* LOADING STATE */}
      {isLoading ? (

        <div className="space-y-4">

          {/* Latest routine skeleton */}
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

          {/* Routine list skeleton */}
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

                <Skeleton className="h-4 w-14" />

                <Skeleton className="size-8 rounded-md" />

              </div>

            ))}

          </div>

        </div>

      ) : routines.length === 0 ? (

        <CreateRoutineDialog
          trigger={
            <Card className="flex flex-row justify-center gap-4 items-center px-4 cursor-pointer">
              <p className="text-sm text-center tracking-tight">
                Adicione uma rotina e faça a magia acontecer 🪄
              </p>
            </Card>
          }
        />

      ) : (

        <Fragment>

          {/* Latest Routine */}
          {stats.latest && (

            <div className="bg-card border border-border rounded-xl p-4">

              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Rotina Mais Recente
              </h3>

              <div className="flex items-center gap-3">

                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-xl">
                  {stats.latest.emoji || "🔁"}
                </div>

                <div className="flex-1">

                  <p className="font-medium">
                    {stats.latest.name}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    criada em{" "}
                    {new Date(stats.latest.createdAt).toLocaleDateString("pt-BR")}
                  </p>

                </div>

              </div>

            </div>

          )}

          {/* Routine List */}
          <div className="bg-card border border-border rounded-xl p-4">

            <h3 className="font-semibold mb-4">
              Lista de Rotinas
            </h3>

            <div className="space-y-3">

              {routines.map((routine, index) => (

                <div key={routine.id} className="flex items-center gap-3">

                  <span className="size-6 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>

                  <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-lg shrink-0">
                    {routine.emoji || "🔁"}
                  </div>

                  <div className="flex-1 min-w-0">

                    <p className="text-sm font-medium truncate">
                      {routine.name}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      criada em{" "}
                      {new Date(routine.createdAt).toLocaleDateString("pt-BR")}
                    </p>

                  </div>

                  <span
                    className={cn(
                      "text-xs font-semibold",
                      routine.status === "ACTIVE"
                        ? "text-green-500"
                        : "text-muted-foreground"
                    )}
                  >
                    {routine.status}
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

                      <UpdateRoutineDialog
                        routine={routine}
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

                      <DeleteRoutineDialog
                        routineId={routine.id}
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

export default RoutineStats