"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Control, useController } from "react-hook-form"
import { Check, ChevronDown, Loader2, SearchX, Volume2 } from "lucide-react"

import CreateVoiceDialog from "@/components/v2/create-voice-dialog"

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

interface Voice {
  id: string
  name: string
  provider: string
  previewUrl?: string
}

async function fetchVoices(): Promise<Voice[]> {
  const res = await fetch("/api/ia/voice")
  if (!res.ok) throw new Error("Erro ao buscar vozes")
  return res.json()
}

export default function VoicePicker({ control }: { control: Control<any> }) {
  const [open, setOpen] = useState(false)

  const { field } = useController({
    control,
    name: "voiceId",
  })

  const { data: voices = [], isLoading } = useQuery({
    queryKey: ["voices"],
    queryFn: fetchVoices,
    staleTime: 1000 * 60,
  })

  const selectedVoice = voices.find(v => v.id === field.value)

  return (
    <div className="flex flex-col gap-2 w-full">
      <Label className="text-sm font-semibold text-white/70 ml-1">
        Voz
      </Label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between bg-white/5 border-white/10 h-11"
          >
            {isLoading ? (
              <div className="flex gap-2 items-center">
                <Loader2 className="animate-spin size-4 text-orange-500" />
                Carregando vozes...
              </div>
            ) : selectedVoice ? (
              <VoiceRow voice={selectedVoice} />
            ) : (
              "Selecione uma voz..."
            )}
            <ChevronDown className="size-4 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-72 p-0 bg-[#0d0808] border-white/10">
          <Command>
            <CommandInput placeholder="Buscar voz..." />

            <div className="p-2 border-b border-white/5">
              <CreateVoiceDialog
                onVoiceCreated={(id) => {
                  field.onChange(id)
                  setOpen(false)
                }}
              />
            </div>

            <CommandList className="max-h-64">
              <CommandEmpty className="py-6 flex flex-col items-center text-white/40">
                <SearchX className="size-6 opacity-30" />
                Nenhuma voz encontrada
              </CommandEmpty>

              <CommandGroup>
                {voices.map((voice) => (
                  <CommandItem
                    key={voice.id}
                    onSelect={() => {
                      field.onChange(voice.id)
                      setOpen(false)
                    }}
                  >
                    <VoiceRow voice={voice} />

                    <Check
                      className={cn(
                        "ml-auto size-4 text-orange-500",
                        field.value === voice.id ? "opacity-100" : "opacity-0"
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

function VoiceRow({ voice }: { voice: Voice }) {
  return (
    <div className="flex items-center gap-2 w-full">
      <Volume2 className="size-4 text-orange-400" />
      <span className="text-white/90">{voice.name}</span>

      {voice.previewUrl && (
        <audio src={voice.previewUrl} controls className="ml-auto h-6" />
      )}
    </div>
  )
}