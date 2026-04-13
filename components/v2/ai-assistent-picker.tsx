"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Control, useController } from "react-hook-form"
import Image from "next/image"
import { Check, ChevronDown, Loader2, SearchX, Sparkles } from "lucide-react"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import CreateAssistantDialog from "./create-assistent-dialog"

interface Assistant {
  id: string
  name: string
  prompt: string
  emoji: {
    imageUrl: string
    name: string
  }
}

interface AiAssistentPickerProps {
  control: Control<any>
  name?: string
}

async function fetchAssistants(): Promise<Assistant[]> {
  const res = await fetch("/api/assistants")
  if (!res.ok) throw new Error("Erro ao buscar assistentes")
  return res.json()
}

export default function AiAssistentPicker({ control, name = "assistantId" }: AiAssistentPickerProps) {
  const [open, setOpen] = useState(false)

  const { field } = useController({
    control,
    name,
  })

  const { data: assistants = [], isLoading } = useQuery({
    queryKey: ["assistants"],
    queryFn: fetchAssistants,
    staleTime: 1000 * 60 * 5, // 5 minutos de cache
  })

  const selectedAssistant = assistants.find((a) => a.id === field.value)

  return (
    <div className="flex flex-col gap-2 w-full">
      <Label className="text-sm font-semibold text-white/70 ml-1">
        Mentor IA
      </Label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            role="combobox"
            variant="outline"
            disabled={isLoading}
            className={cn(
              "w-full justify-between bg-white/5 border-white/10 hover:bg-white/10 h-12",
              !selectedAssistant && "text-muted-foreground"
            )}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
                <span>Carregando mentores...</span>
              </div>
            ) : selectedAssistant ? (
              <AssistantRow assistant={selectedAssistant} />
            ) : (
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span>Escolha um mentor para este hábito...</span>
              </div>
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[320px] p-0 border-white/10 bg-[#0d0808]" align="start">
          <Command className="bg-transparent">
            <CommandInput placeholder="Buscar mentor..." className="h-10" />
            
            <div className="p-2 border-b border-white/5">
              <CreateAssistantDialog />
            </div>

            <CommandList className="max-h-80 custom-scrollbar">
              <CommandEmpty className="py-6 flex flex-col items-center justify-center gap-2 text-white/40">
                <SearchX className="h-8 w-8 opacity-20" />
                <p className="text-sm">Nenhum mentor encontrado.</p>
              </CommandEmpty>

              <CommandGroup heading="Mentores Disponíveis">
                {assistants.map((assistant) => (
                  <CommandItem
                    key={assistant.id}
                    onSelect={() => {
                      field.onChange(assistant.id)
                      setOpen(false)
                    }}
                    className="cursor-pointer data-[selected=true]:bg-white/10 py-3"
                  >
                    <AssistantRow assistant={assistant} />
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4 text-purple-500",
                        field.value === assistant.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

function AssistantRow({ assistant }: { assistant: Assistant }) {
  return (
    <div className="flex items-center gap-3 w-full min-w-0">
      <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full border border-purple-500/30">
        <Image
          src={assistant.emoji.imageUrl}
          alt={assistant.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="truncate font-medium text-white/90 text-sm">
          {assistant.name}
        </span>
        <span className="truncate text-[10px] text-white/40 uppercase tracking-wider">
          AI Mentor
        </span>
      </div>
    </div>
  )
}