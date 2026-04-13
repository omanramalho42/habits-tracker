"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Control, useController } from "react-hook-form"
import { Check, ChevronDown, Loader2, Plus, SearchX, Square, Volume2 } from "lucide-react"

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
      <Label className="text-sm font-semibold text-white/70 ml-1">Voz</Label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={voices.length === 0}
            className="w-full justify-between bg-white/5 border-white/10 h-11"
          >
            {isLoading ? (
              <div className="flex gap-2 items-center">
                <Loader2 className="animate-spin size-4 text-orange-500" />
                Carregando...
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

            <div className="p-2 border-b border-white/5 opacity-50 pointer-events-none">
               {/* Desabilitado conforme solicitado */}
               <Button variant="ghost" disabled className="w-full justify-start gap-2">
                 <Plus className="size-4" />
                 Custom Voice (Em breve)
               </Button>
            </div>

            <CommandList className="max-h-64">
              <CommandEmpty>Nenhuma voz encontrada.</CommandEmpty>
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
  const [isPlaying, setIsPlaying] = useState(false)

  const playPreview = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (voice.previewUrl) {
      const audio = new Audio(voice.previewUrl)
      setIsPlaying(true)
      audio.play()
      audio.onended = () => setIsPlaying(false)
    }
  }

  return (
    <div className="flex items-center gap-2 w-full group">
      <div className="flex flex-col flex-1">
        <span className="text-white/90 text-sm">{voice.name}</span>
        <span className="text-[10px] text-white/30 uppercase tracking-tighter">{voice.provider}</span>
      </div>

      {voice.previewUrl && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            "ml-auto size-8 rounded-full transition-colors",
            isPlaying ? "bg-orange-500/20 text-orange-500" : "hover:bg-white/10 text-white/40"
          )}
          onClick={playPreview}
        >
          {isPlaying ? (
            <Square className="size-3 fill-current animate-pulse" />
          ) : (
            <Volume2 className="size-3" />
          )}
        </Button>
      )}
    </div>
  )
}