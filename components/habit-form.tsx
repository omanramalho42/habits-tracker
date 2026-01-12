"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { WEEKDAYS } from "@/lib/habit-utils"
import type { HabitFormData, HabitWithStats } from "@/lib/types"
import { Switch } from "@/components/ui/switch"
import data from "@emoji-mart/data"
import Picker from "@emoji-mart/react"

interface HabitFormProps {
  onSubmit: (data: HabitFormData) => void
  onCancel: () => void
  initialData?: HabitWithStats
  isSubmitting?: boolean
}

const COLOR_OPTIONS = [
  "#3B82F6", // blue
  "#8B5CF6", // purple
  "#06B6D4", // cyan
  "#10B981", // green
  "#F59E0B", // amber
  "#EF4444", // red
]

export function HabitForm({ onSubmit, onCancel, initialData, isSubmitting }: HabitFormProps) {
  const [formData, setFormData] = useState<HabitFormData>({
    name: initialData?.name || "",
    emoji: initialData?.emoji || "🎯",
    goal: initialData?.goal || "",
    motivation: initialData?.motivation || "",
    startDate: initialData?.startDate || new Date().toISOString().split("T")[0],
    endDate: initialData?.endDate || null,
    reminder: initialData?.reminder || false,
    frequency: initialData?.frequency || ["M", "T", "W", "TH", "F", "SA", "S"],
    color: initialData?.color || "#3B82F6",
  })

  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const toggleFrequency = (dayKey: string) => {
    setFormData((prev) => ({
      ...prev,
      frequency: prev.frequency.includes(dayKey)
        ? prev.frequency.filter((d) => d !== dayKey)
        : [...prev.frequency, dayKey],
    }))
  }

  const [date, setDate] = useState<Date | undefined>(
    initialData?.startDate ? new Date(initialData.startDate) : new Date(),
  )

  const [neverEnds, setNeverEnds] = useState(!initialData?.endDate)

  const [endDate, setEndDate] = useState<Date | undefined>(
    initialData?.endDate ? new Date(initialData.endDate) : undefined,
  )

  return (
    <Card className="p-6 bg-card border-border">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label className="text-sm font-semibold mb-3 block">Select Emoji</Label>
          <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full h-20 text-5xl hover:scale-105 transition-transform bg-transparent"
              >
                {formData.emoji}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 border-0" align="start">
              <Picker
                data={data}
                onEmojiSelect={(emoji: any) => {
                  setFormData((prev) => ({ ...prev, emoji: emoji.native }))
                  setShowEmojiPicker(false)
                }}
                theme="dark"
                previewPosition="none"
                skinTonePosition="none"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label htmlFor="name" className="text-sm font-semibold">
            Habit Name
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Morning yoga"
            required
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="goal" className="text-sm font-semibold">
            Goal
          </Label>
          <Input
            id="goal"
            value={formData.goal}
            onChange={(e) => setFormData((prev) => ({ ...prev, goal: e.target.value }))}
            placeholder="e.g., 15 minutes per day"
            required
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="motivation" className="text-sm font-semibold">
            Motivation
          </Label>
          <Input
            id="motivation"
            value={formData.motivation}
            onChange={(e) => setFormData((prev) => ({ ...prev, motivation: e.target.value }))}
            placeholder="e.g., Improve mental health"
            required
            className="mt-1.5"
          />
        </div>

        <div>
          <Label className="text-sm font-semibold mb-1.5 block">Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => {
                  setDate(newDate)
                  if (newDate) {
                    setFormData((prev) => ({
                      ...prev,
                      startDate: newDate.toISOString().split("T")[0],
                    }))
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label className="text-sm font-semibold">End Date</Label>
            <div className="flex items-center gap-2">
              <Label htmlFor="never-ends" className="text-sm text-muted-foreground cursor-pointer">
                Never
              </Label>
              <Switch
                id="never-ends"
                checked={neverEnds}
                onCheckedChange={(checked) => {
                  setNeverEnds(checked)
                  if (checked) {
                    setEndDate(undefined)
                    setFormData((prev) => ({ ...prev, endDate: null }))
                  }
                }}
              />
            </div>
          </div>
          {!neverEnds && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : <span>Pick an end date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(newDate) => {
                    setEndDate(newDate)
                    if (newDate) {
                      setFormData((prev) => ({
                        ...prev,
                        endDate: newDate.toISOString().split("T")[0],
                      }))
                    }
                  }}
                  disabled={(date) => date < (formData.startDate ? new Date(formData.startDate) : new Date())}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          )}
        </div>

        <div>
          <Label className="text-sm font-semibold mb-3 block">Select Frequency</Label>
          <div className="flex gap-2">
            {WEEKDAYS.map((day) => (
              <button
                key={day.key}
                type="button"
                onClick={() => toggleFrequency(day.key)}
                className={`flex-1 py-3 px-3 rounded-xl font-bold text-sm transition-all ${
                  formData.frequency.includes(day.key)
                    ? "bg-primary text-primary-foreground shadow-md scale-105"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm font-semibold mb-3 block">Color Theme</Label>
          <div className="flex gap-3">
            {COLOR_OPTIONS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, color }))}
                className={`w-12 h-12 rounded-xl border-3 transition-all hover:scale-110 ${
                  formData.color === color ? "border-foreground scale-110 shadow-lg" : "border-transparent"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 bg-transparent"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 shadow-md" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : initialData ? "Update Habit" : "Create Habit"}
          </Button>
        </div>
      </form>
    </Card>
  )
}
