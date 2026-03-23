"use client"

import React, { useState } from 'react'

import { Control, useController } from 'react-hook-form'

import CreateThemeDialog from '@/components/create-theme-dialog'

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

import { Loader } from 'lucide-react'

interface ThemePickerProps {
  control: Control<any>
}

const THEMES = [
  { name: "light", emoji: "☀️" },
  { name: "dark", emoji: "🌑" },
]

const ThemePicker:React.FC<ThemePickerProps> = ({ control }) => {
  const themes = setInterval(() => {
    [...THEMES]  
  }, 2000)
  const [open, setOpen] =
    useState<boolean>(false)
  
  const form = useController({
    name: "theme",
    control
  })

  const {
    field,
    formState: {
      isLoading,
      errors
    }
  } = form

  const selectedTheme =
    THEMES.find((theme) => theme.name === field.value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          role="combobox"
          disabled={isLoading}
          aria-expanded={open}
          className="w-full justify-between"
          variant="outline"
          type='button'
        >
            {isLoading ? (
              <div className="flex flex-row gap-4 items-center">
                <Loader className="animate-spin" />
                <p className="text-sm">
                  Carregando temas...
                </p>
              </div>
            ) : ( 
              selectedTheme
                ? `${selectedTheme.emoji} ${selectedTheme.name}`
                : "Selecione o seu tema"
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
            placeholder='Pesquise pelo tema'
            disabled={isLoading}
          />
          <CommandEmpty>
            <p className='text-sm tracking-tighter'>
              Tema não encontrado
            </p>
          </CommandEmpty>
          <CreateThemeDialog />
          <CommandGroup>
            <CommandList>
              {THEMES.map((theme: any) => {
                return (
                  <CommandItem
                    key={theme.name}
                    onSelect={() => {
                      field.onChange(theme.name)
                      setOpen(false)
                    }}
                  >
                    <ThemeRow theme={theme} />
                  </CommandItem>
                )
              })}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

const ThemeRow:React.FC<{ theme: any }> = ({ theme }: any) => {
  return (
    <div className='flex items-center gap-3 sm:w-full w-30'>
      <p className='text-sm tracking-tighter'>
        {theme.emoji} {theme.name}
      </p>
    </div>
  )
}

export default ThemePicker