"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MultiSelectProps {
  options: {
    id: string
    label: string
    description?: string
  }[]
  value: string[]
  onChange: (value: string[]) => void
}

export function PreferencesMultiSelect({
  options,
  value,
  onChange,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const toggleOption = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id))
    } else {
      onChange([...value, id])
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between"
        >
          {value.length > 0
            ? `${value.length} preferências selecionadas`
            : "Selecionar preferências"
          }
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Buscar preferências..." />

          <CommandList>
            <CommandEmpty>Nenhuma encontrada</CommandEmpty>

            <CommandGroup heading="Preferências">
              {options.map((option) => {
                const isSelected = value.includes(option.id)

                return (
                  <CommandItem
                    key={option.id}
                    onSelect={() => toggleOption(option.id)}
                    className="flex items-start gap-2"
                  >
                    <Check
                      className={cn(
                        "mt-1 h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />

                    <div className="flex flex-col">
                      <span>{option.label}</span>
                      {option.description && (
                        <span className="text-xs text-muted-foreground">
                          {option.description}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}