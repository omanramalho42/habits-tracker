"use client"

import React, { useCallback, useState } from 'react'
import { Control, useController } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandEmpty
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Check, Bell, Plus, X } from "lucide-react"
import { Input } from '@/components/ui/input'

// Sugestões rápidas de alarmes (Offsets ou horários fixos)
const PRESET_ALARMS = [
  { id: '1', triggerTime: '00:00:00', message: 'Na hora exata' },
  { id: '2', triggerTime: '00:05:00', message: '5 minutos antes' },
  { id: '3', triggerTime: '00:15:00', message: '15 minutos antes' },
]

interface MultiAlarmsPickerProps {
  control: Control<any>
  name: string // Ex: "habits[index].alarms"
}

export const MultiAlarmsPicker: React.FC<MultiAlarmsPickerProps> = ({ control, name }) => {
  const [open, setOpen] = useState<boolean>(false)
  const [customTime, setCustomTime] = useState("")

  const { field } = useController({
    control,
    name
  })

  const alarms: any[] = field?.value || []

  const toggleAlarm = (alarm: any) => {
    const exists = alarms.find(a => a.triggerTime === alarm.triggerTime)
    if (exists) {
      field.onChange(alarms.filter(a => a.triggerTime !== alarm.triggerTime))
    } else {
      field.onChange([...alarms, { ...alarm, id: crypto.randomUUID() }])
    }
  }

  const addCustomAlarm = () => {
    if (!customTime) return
    // Formata input "08:00" para "08:00:00" se necessário
    const formattedTime = customTime.length === 5 ? `${customTime}:00` : customTime
    toggleAlarm({ triggerTime: formattedTime, message: "Lembrete personalizado" })
    setCustomTime("")
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start gap-2 h-auto min-h-[40px] flex-wrap p-2 border-dashed border-white/20 hover:border-white/40 bg-white/5"
        >
          <Bell className="w-4 h-4 text-purple-400" />
          {alarms.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {alarms.map((alarm, i) => (
                <span key={i} className="bg-purple-500/20 text-purple-200 text-[10px] px-2 py-0.5 rounded-full border border-purple-500/30">
                  {alarm.triggerTime}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-muted-foreground text-xs">Configurar lembretes...</span>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-72 p-0 bg-zinc-950 border-white/10">
        <div className="p-3 border-b border-white/10">
          <Label className="text-xs text-zinc-400 uppercase tracking-widest">Novo Alarme</Label>
          <div className="flex gap-2 mt-2">
            <Input 
              type="time" 
              step="1"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
              className="h-8 bg-white/5 border-white/10 text-xs"
            />
            <Button size="sm" onClick={addCustomAlarm} className="h-8 bg-purple-600 hover:bg-purple-500">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Command>
          <CommandList>
            <CommandEmpty>Nenhuma sugestão encontrada.</CommandEmpty>
            <CommandGroup heading="Sugestões">
              {PRESET_ALARMS.map((preset) => {
                const isSelected = alarms.some(a => a.triggerTime === preset.triggerTime)
                return (
                  <CommandItem
                    key={preset.id}
                    onSelect={() => toggleAlarm(preset)}
                    className="flex items-center justify-between cursor-pointer py-2"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{preset.triggerTime}</span>
                      <span className="text-[10px] text-muted-foreground">{preset.message}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-purple-500" />}
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