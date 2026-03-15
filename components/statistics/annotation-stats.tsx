import React from 'react'

import UpdateAnnotationDialog from '@/components/annotations/update-annotation-dialog'
import DeleteAnnotationDialog from '@/components/annotations/delete-annotation-dialog'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

import { Skeleton } from '@/components/ui/skeleton'

import { cn } from '@/lib/utils'

import type { Annotations } from '@prisma/client'

import {
  MoreVertical,
  Pencil,
  Trash2
} from 'lucide-react'

interface AnnotationStatsProps {
  isLoading: boolean
  annotations: Annotations[]
}

const AnnotationStats: React.FC<AnnotationStatsProps> = ({ annotations, isLoading }) => {

  const latest = !isLoading && annotations.length > 0
    ? [...annotations].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      )[0]
    : null

  const list = isLoading ? Array.from({ length: 5 }) : annotations

  return (
    <div className='flex flex-col gap-6'>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 gap-3">

        <div className="bg-primary rounded-xl p-4">
          <div className="flex items-center gap-2 text-primary-foreground/80 mb-1">
            <span className="text-xs">Total de Anotações</span>
          </div>

          {isLoading ? (
            <Skeleton className="h-8 w-16 bg-white/20" />
          ) : (
            <p className="text-3xl font-bold text-primary-foreground">
              {annotations.length}
            </p>
          )}

          <p className="text-xs text-primary-foreground/70 mt-1">
            registradas
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <span className="text-xs">Criadas por IA</span>
          </div>

          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <p className="text-3xl font-bold">
              {annotations.filter(a => a.createdByAI).length}
            </p>
          )}

          <p className="text-xs text-muted-foreground mt-1">
            geradas automaticamente
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <span className="text-xs">Com Resumo</span>
          </div>

          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <p className="text-3xl font-bold">
              {annotations.filter(a => a.summary).length}
            </p>
          )}

          <p className="text-xs text-muted-foreground mt-1">
            possuem resumo
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <span className="text-xs">Com Imagem</span>
          </div>

          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <p className="text-3xl font-bold">
              {annotations.filter(a => a.imageUrl).length}
            </p>
          )}

          <p className="text-xs text-muted-foreground mt-1">
            possuem mídia
          </p>
        </div>

      </div>

      {/* Recent Annotation */}
      <div className="bg-card border border-border rounded-xl p-4">

        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          Anotação Mais Recente
        </h3>

        {isLoading ? (
          <div className="flex items-start gap-3">
            <Skeleton className="size-10 rounded-lg" />

            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
        ) : latest ? (
          <div className="flex items-start gap-3">

            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg shrink-0">
              📝
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
                {latest.name}
              </p>

              {latest.summary && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {latest.summary}
                </p>
              )}

              <p className="text-xs text-muted-foreground mt-1">
                criada em{" "}
                {new Date(latest.createdAt).toLocaleDateString("pt-BR")}
              </p>
            </div>

            {latest.createdByAI && (
              <span className="text-xs text-primary font-medium">
                IA
              </span>
            )}

          </div>
        ) : null}

      </div>

      {/* Lista */}
      <div className="bg-card border border-border rounded-xl p-4">

        <h3 className="font-semibold mb-4">
          Lista de Anotações
        </h3>

        <div className="space-y-3">

          {list.map((annotation: any, index) => (
            <div
              key={index}
              className="flex items-start gap-3"
            >

              <span className="size-6 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                {index + 1}
              </span>

              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                📝
              </div>

              <div className="flex-1 min-w-0">

                {isLoading ? (
                  <>
                    <Skeleton className="h-4 w-48 mb-1" />
                    <Skeleton className="h-3 w-64 mb-1" />
                    <Skeleton className="h-3 w-28" />
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium truncate">
                      {annotation.name}
                    </p>

                    {annotation.content && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {annotation.content}
                      </p>
                    )}

                    <p className="text-xs text-muted-foreground">
                      data de criação: {new Date(annotation.createdAt).toLocaleDateString("pt-BR")}
                    </p>

                    {annotation.updatedAt && (
                      <p className="text-xs text-primary">
                        última modificação: {new Date(annotation.updatedAt).toLocaleDateString("pt-BR")}
                      </p>
                    )}
                  </>
                )}

              </div>

              {!isLoading && (
                <div className="flex flex-col items-end gap-1">

                  {annotation.createdByAI && (
                    <span className="text-xs text-primary font-medium">
                      IA
                    </span>
                  )}

                  {annotation.imageUrl && (
                    <span className="text-xs text-muted-foreground">
                      imagem
                    </span>
                  )}

                  <div
                    className={cn(
                      "flex justify-center items-center gap-1 transition-opacity"
                    )}
                  >
                    <DropdownMenu>

                      <DropdownMenuTrigger asChild>
                        <Button
                          type='button'
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-44">

                        <UpdateAnnotationDialog
                          annotation={annotation}
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

                        <DeleteAnnotationDialog
                          annotationId={annotation.id}
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
              )}

            </div>
          ))}

        </div>

      </div>

    </div>
  )
}

export default AnnotationStats