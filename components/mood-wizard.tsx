"use client"

import { useCallback, useEffect, useState } from "react"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import axios from "axios"
import { Controller, useForm } from "react-hook-form"
import z from "zod"

import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

import type { HabitWithStats } from "@/lib/types"

import { ArrowBigLeft } from "lucide-react"
import { MoodEntry } from "@prisma/client"
import { toast } from "sonner"

interface MoodWizardProps {
  onSuccessCallback?: (data: HabitWithStats[]) => void
  trigger?: React.ReactNode
}

const MOOD_OPTIONS = [
  { type: "joyful", emoji: "😊", color: "#FCD34D", label: "Joyful" },
  { type: "cheerful", emoji: "😄", color: "#34D399", label: "Cheerful" },
  { type: "content", emoji: "😌", color: "#60A5FA", label: "Content" },
  { type: "neutral", emoji: "😐", color: "#9CA3AF", label: "Neutral" },
  { type: "anxious", emoji: "😰", color: "#F59E0B", label: "Anxious" },
  { type: "sad", emoji: "😢", color: "#3B82F6", label: "Sad" },
  { type: "angry", emoji: "😠", color: "#EF4444", label: "Angry" },
]

const MOOD_LEVELS = {
  joyful: [
    { level: "ecstatic", label: "Ecstatic" },
    { level: "happy", label: "Happy" },
    { level: "pleased", label: "Pleased" },
  ],
  cheerful: [
    { level: "energetic", label: "Energetic" },
    { level: "optimistic", label: "Optimistic" },
    { level: "content", label: "Content" },
  ],
  content: [
    { level: "peaceful", label: "Peaceful" },
    { level: "satisfied", label: "Satisfied" },
    { level: "calm", label: "Calm" },
  ],
  neutral: [
    { level: "indifferent", label: "Indifferent" },
    { level: "numb", label: "Numb" },
    { level: "detached", label: "Detached" },
  ],
  anxious: [
    { level: "worried", label: "Worried" },
    { level: "nervous", label: "Nervous" },
    { level: "stressed", label: "Stressed" },
  ],
  sad: [
    { level: "melancholic", label: "Melancholic" },
    { level: "lonely", label: "Lonely" },
    { level: "down", label: "Down" },
  ],
  angry: [
    { level: "frustrated", label: "Frustrated" },
    { level: "irritated", label: "Irritated" },
    { level: "furious", label: "Furious" },
  ],
}

export function MoodWizard({ trigger }: MoodWizardProps) {
  const moodSchema = z.object({
    mood: z.object({
      type: z.string(),
      emoji: z.string(),
      color: z.string(),
      label: z.string()
    }),
    level: z.string(),
  })
  const { control, watch, formState: { errors }} = useForm<z.infer<typeof moodSchema>>({
    defaultValues: {
      mood: {},
      level: ""
    }
  });

  const [step, setStep] = useState(1)

  const today = new Date().toISOString().split("T")[0]

  const { data: mood, isFetched } = useQuery<MoodEntry>({
    queryKey: ["mood", today],
    queryFn: async () => {
      const { data } = await axios.get(`/api/mood?date=${today}`)

      return data
    },
  })

  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (isFetched) setOpen(!mood)
  }, [isFetched, mood])

  console.log(mood, "mood")

  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      return axios.post("/api/mood", {
        mood_type: watch('mood').type,
        mood_level: watch('level'),
        entry_date: new Date().toISOString().split("T")[0],
      })
    },
    onSuccess: async () => {
      toast.success("Mood diário registrado com sucesso.", { id: "create-mood" })

      // 🔥 AQUI A MÁGICA ACONTECE
      await queryClient.invalidateQueries({
        queryKey: ["habits", "stats"],
      })

      await queryClient.invalidateQueries({
        queryKey: ["mood"],
      })

      setOpen(false)
    },
    onError: () => {
      toast.error("Erro ao salvar o mood. Por favor tente novamente.", { id: "create-mood"})
    },
  })

  const moodLevels = 
    watch('mood').type 
    ? MOOD_LEVELS[watch("mood").type as keyof typeof MOOD_LEVELS] 
    : []

  const handleCreateMood = useCallback(() => {
    toast.loading("Registrando mood...", { id: "create-mood" })

    mutate()
  },[]);

  if (isFetched && mood) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-125 bg-background border-border p-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="p-8"
            >
              <h2 className="text-4xl font-bold text-foreground mb-2 text-balance">
                Como você está se sentindo hoje?
              </h2>
              <p className="text-muted-foreground mb-8 text-sm">
                Selecione para ler mais...
              </p>

              <div className="grid grid-cols-3 gap-3 mb-8">
                {MOOD_OPTIONS.slice(0, 3).map((mood) => (
                  <Controller
                    key={mood.type}
                    control={control}
                    name="mood"
                    render={({ field }) => (
                      <Button
                        onClick={() => field.onChange(mood)}
                        className={`py-3 px-4 rounded-xl font-medium transition-all text-sm ${
                          watch("mood").type === mood.type
                            ? "bg-primary text-primary-foreground shadow-lg scale-105"
                            : "bg-muted text-foreground hover:bg-muted/80"
                        }`}
                      >
                        {mood.label}
                      </Button>
                    )}
                  />
                ))}
              </div>

              {watch("mood").emoji ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="rounded-3xl p-12 mb-6 flex items-center justify-center"
                  style={{ backgroundColor: watch("mood")?.color }}
                >
                  <span className="text-9xl">{watch("mood")?.emoji}</span>
                </motion.div>
              ) : (
                <div className="rounded-3xl bg-yellow-400 p-12 mb-6 flex items-center justify-center">
                  <span className="text-9xl">😊</span>
                </div>
              )}

              <Button
                onClick={() => setStep(2)}
                disabled={!watch("mood").emoji}
                className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-full py-6 text-base font-semibold"
              >
                Começar
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="relative min-h-150 flex flex-col"
              style={{ backgroundColor: watch("mood")?.color || "#FCD34D" }}
            >
              <div className="flex items-center justify-between p-6">
                <Button
                  variant="ghost"
                  onClick={() => setStep(1)}
                  className="rounded-full w-10 h-10 p-0 bg-white/20 hover:bg-white/30"
                >
                  <ArrowBigLeft />
                </Button>
                <Button
                  onClick={handleCreateMood}
                  disabled={!watch("level") || isPending}
                  className="rounded-full px-6 bg-white/20 hover:bg-white/30 text-foreground font-semibold"
                >
                  {isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>

              <div className="flex-1 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-9xl"
                >
                  {watch("mood")?.emoji}
                </motion.div>
              </div>

              <div className="bg-background rounded-t-3xl p-8">
                <h2 className="text-3xl font-bold text-foreground mb-2 text-balance">
                  Selecione o seu mood de hoje
                </h2>

                <div className="h-24 relative mb-6">
                  <div className="absolute inset-0 flex items-end justify-center opacity-20">
                    {Array.from({ length: 50 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-foreground mx-0.5 rounded-t"
                        style={{ height: `${Math.random() * 100}%` }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  {moodLevels.map((level) => (
                    <Controller
                      key={level.level}
                      name="level"
                      control={control}
                      render={({ field }) => (
                        <Button
                          onClick={() => field.onChange(level.level)}
                          className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all text-sm ${
                            watch("level") === level.level
                              ? "shadow-lg scale-105"
                              : "bg-muted text-foreground hover:bg-muted/80"
                          }`}
                          style={
                            watch("level") === level.level ? { backgroundColor: watch("mood")?.color, color: "#000" } : {}
                          }
                        >
                          {level.label}
                        </Button>
                      )}
                    />
                  ))}
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
