"use client"

import React, { Fragment, useMemo } from 'react'

import UpdateCategorieDialog from '@/components/categories/update-categorie-dialog'
import DeleteCategorieDialog from '@/components/categories/delete-categorie-dialog'
import CreateCategorieDialog from '@/components/categories/create-categorie-dialog'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

import { cn } from '@/lib/utils'

import type { Habit } from '@prisma/client'

import {
  MoreVertical,
  Pencil,
  Trash2
} from 'lucide-react'

import type { CategoriesDTO } from '@/services/categories'

interface CategorieStatsProps {
  isLoading: boolean
  categories: (CategoriesDTO & { habits?: Habit[] })[]
}

const CategorieStats: React.FC<CategorieStatsProps> = ({
  categories,
  isLoading
}) => {

  const stats = useMemo(() => {

    const active = categories.filter(c => c.status === "ACTIVE").length
    const withHabits = categories.filter(c => c.habits?.length).length
    const withoutHabits = categories.filter(c => !c.habits?.length).length

    const latest =
      categories.length > 0
        ? [...categories].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime()
          )[0]
        : null

    return {
      total: categories.length,
      active,
      withHabits,
      withoutHabits,
      latest
    }

  }, [categories])

  return (
    <div className='flex flex-col gap-6'>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 gap-3">

        <div className="bg-primary rounded-xl p-4">
          <span className="text-xs text-primary-foreground/80">
            Total de Categorias
          </span>

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
          <span className="text-xs text-muted-foreground">
            Ativas
          </span>

          {isLoading ? (
            <Skeleton className="h-8 w-12" />
          ) : (
            <p className="text-3xl font-bold">
              {stats.active}
            </p>
          )}

          <p className="text-xs text-muted-foreground mt-1">
            em uso
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <span className="text-xs text-muted-foreground">
            Com Hábitos
          </span>

          {isLoading ? (
            <Skeleton className="h-8 w-12" />
          ) : (
            <p className="text-3xl font-bold">
              {stats.withHabits}
            </p>
          )}

          <p className="text-xs text-muted-foreground mt-1">
            possuem hábitos
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <span className="text-xs text-muted-foreground">
            Sem Hábitos
          </span>
          
          {isLoading ? (
            <Skeleton className="h-8 w-12" />
          ) : (
            <p className="text-3xl font-bold">
              {stats.withoutHabits}
            </p>
          )}

          <p className="text-xs text-muted-foreground mt-1">
            ainda vazias
          </p>
        </div>

      </div>

      {isLoading ? (

        <div className="space-y-4">

          {/* Latest category skeleton */}
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

          {/* Category list skeleton */}
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

                <Skeleton className="h-4 w-16" />

              </div>

            ))}

          </div>

        </div>

      ) : categories.length === 0 ? (

        <CreateCategorieDialog
          trigger={
            <Card className="flex flex-row justify-center gap-4 items-center px-4 cursor-pointer">
              <p className="text-sm text-center tracking-tight">
                Adicione categorias e faça a magia acontecer 🪄
              </p>
            </Card>
          }
        />

      ) : (

        <Fragment>

          {/* Latest Category */}
          {stats.latest && (

            <div className="bg-card border border-border rounded-xl p-4">

              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Categoria Mais Recente
              </h3>

              <div className="flex items-center gap-3">

                <div
                  className="size-12 rounded-xl flex items-center justify-center text-xl"
                  style={{
                    backgroundColor: stats.latest.color || "hsl(var(--primary) / 0.1)"
                  }}
                >
                  {stats.latest.emoji || "📂"}
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

          {/* Category List */}
          <div className="bg-card border border-border rounded-xl p-4">

            <h3 className="font-semibold mb-4">
              Lista de Categorias
            </h3>

            <div className="space-y-3">

              {categories.map((category, index) => (

                <div key={category.id} className="flex items-center gap-3">

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

                  <div
                    className="size-8 rounded-lg flex items-center justify-center shrink-0 text-lg"
                    style={{
                      backgroundColor: category.color || "hsl(var(--primary) / 0.1)"
                    }}
                  >
                    {category.emoji || "📂"}
                  </div>

                  <div className="flex-1 min-w-0">

                    <p className="text-sm font-medium truncate">
                      {category.name}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {category.habits?.length || 0} hábitos
                    </p>

                  </div>

                  <span
                    className={cn(
                      "text-xs font-semibold",
                      category.status === "ACTIVE"
                        ? "text-green-500"
                        : "text-muted-foreground"
                    )}
                  >
                    {category.status}
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

                      <UpdateCategorieDialog
                        categorie={category}
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

                      <DeleteCategorieDialog
                        categorieId={category.id}
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

export default CategorieStats