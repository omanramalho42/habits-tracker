"use client"

import React, { useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import { Control, useController } from 'react-hook-form'

import CreateGoalDialog from '@/components/goals/create-goal-dialog'

import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'

import { Check } from 'lucide-react'
import { CategoriesDTO, fetchCategories } from '@/services/categories'
import { Categories } from '@prisma/client'
import CreateCategorieDialog from './categories/create-categorie-dialog'

interface CategoriePickerProps {
  control: Control<any>
  onSuccessCallback?: (value: string) => void
}

const CategoriePicker:React.FC<CategoriePickerProps> = ({ control }) => {
  const [open, setOpen] = useState<boolean>(false)

  const { field } = useController({
    control: control,
    name: 'categories'
  })

  // REALIZAR UMA QUERY PARA OBJETIVOS
  const {
    data: categories = [],
    isLoading,
    isFetching,
    isError,
    error
  } = useQuery<Categories[]>({
    queryKey: ["categories"],
    queryFn: () => fetchCategories(),
    staleTime: 1000 * 60,
    retry: 1,
  })

  const selectedCategorie =
    categories.find(
      (categorie: Categories) => 
        categorie.id === field.value || ""
    )
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          role='combobox'
          aria-expanded={open}
          className="w-full justify-between"
          variant="outline"
        >
        {selectedCategorie ? (
            <CategorieRow categorie={selectedCategorie} />
          ) : (
            'Selecione a categoria'
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-50 p-0'>
        <Command
          onSubmit={(e) => {
            e.preventDefault()
          }}
        >
          <CommandInput
            disabled={isLoading || isFetching}
            placeholder="Pesquise a categoria..."
          />
          <CreateCategorieDialog
            // onSuccessCallback={() => {}}
          />
          <CommandEmpty className='p-2'>
            <p className='text-sm'>
              Categoria não encontrado
            </p>
            <p className="text-xs text-muted-foreground">
              Criar nova categoria
            </p>
          </CommandEmpty>
          <CommandGroup>
            <CommandList>
              {categories && (
                categories.map((categorie) => (
                  <CommandItem
                    key={categorie.id}
                    onSelect={() => {
                      field.onChange(categorie.id)
                      setOpen((prev) => !prev)
                    }}
                  >
                    <CategorieRow categorie={categorie} />
                    <Check className={cn("mr-2 h-4 w-4 opacity-0")} />
                  </CommandItem>
                ))
              )}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

function CategorieRow({ categorie }: { categorie: any }) {
  return (
    <div className="flex items-center gap-2 sm:w-full w-40">
      <span role="img">{categorie.emoji}</span>
      <span className='truncate sm:max-w-auto'>{categorie.name}</span>
    </div>
  )
}

export default CategoriePicker