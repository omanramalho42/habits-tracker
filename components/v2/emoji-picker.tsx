"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Control, useController } from "react-hook-form"
import Image from "next/image"
import { Check, ChevronDown, Loader2, SearchX } from "lucide-react"

import CreateEmojiDialog from "@/components/v2/create-emoji-dialog"
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
import { Label } from "@/components/ui/label" // Import do Label
import { cn } from "@/lib/utils"

interface Emoji {
  id: string
  name: string
  imageUrl: string
}

interface EmojiPickerProps {
  control: Control<any>
}

async function fetchEmojis(): Promise<Emoji[]> {
  const res = await fetch("/api/emoji")
  if (!res.ok) throw new Error("Erro ao buscar emojis")
  return res.json()
}

export default function CustomEmojiPicker({ control }: EmojiPickerProps) {
  const [open, setOpen] = useState(false)

  const { field } = useController({
    control,
    name: "emojiId",
  })

  const { data: emojis = [], isLoading } = useQuery({
    queryKey: ["emojis"],
    queryFn: () => fetchEmojis(),
    staleTime: 1000 * 60,
    retry: 1
  })

  console.log(emojis, "emojis")

  const selectedEmoji = emojis.find((emoji) => emoji.id === field.value)

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* 1. Label Adicionado */}
      <Label className="text-sm font-semibold text-white/70 ml-1">
        Ícone
      </Label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            role="combobox"
            variant="outline"
            disabled={isLoading}
            className={cn(
              "w-full justify-between bg-white/5 border-white/10 hover:bg-white/10 h-11",
              !selectedEmoji && "text-muted-foreground"
            )}
          >
            {/* 2. Estado de Loading no Botão */}
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                <span>Carregando icones...</span>
              </div>
            ) : selectedEmoji ? (
              <EmojiRow emoji={selectedEmoji} />
            ) : (
              "Selecione um ícone..."
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-70 p-0 border-white/10 bg-[#0d0808]" align="start">
          <Command className="bg-transparent">
            <CommandInput placeholder="Buscar ícone..." className="h-10" />
            
            <div className="p-2 border-b border-white/5">
              <CreateEmojiDialog
                onEmojiCreated={(id) => {
                  field.onChange(id)
                  setOpen(false)
                }}
              />
            </div>

            <CommandList className="max-h-64">
              {/* 3. Mensagem Customizada para Vazio */}
              <CommandEmpty className="py-6 flex flex-col items-center justify-center gap-2 text-white/40">
                <SearchX className="h-8 w-8 opacity-20" />
                <p className="text-sm">Nenhum icone encontrado.</p>
              </CommandEmpty>

              <CommandGroup>
                {emojis.map((emoji) => (
                  <CommandItem
                    key={emoji.id}
                    onSelect={() => {
                      field.onChange(emoji.id)
                      setOpen(false)
                    }}
                    className="cursor-pointer data-[selected=true]:bg-white/10"
                  >
                    <EmojiRow emoji={emoji} />
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4 text-orange-500",
                        field.value === emoji.id ? "opacity-100" : "opacity-0"
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

function EmojiRow({ emoji }: { emoji: any }) {
  const isImage =
    /^https?:\/\//.test(emoji.imageUrl) || emoji.imageUrl.startsWith("data:")

  return (
    <div className="flex items-center gap-3 w-full min-w-0">
      {isImage ? (
        <div className="relative h-5 w-5 shrink-0 overflow-hidden rounded-sm border border-white/10">
          <Image
            src={emoji.imageUrl}
            alt={emoji.name}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <span className="text-base leading-none shrink-0">{emoji.imageUrl}</span>
      )}
      <span className="truncate font-medium text-white/90">{emoji.name}</span>
    </div>
  )
}