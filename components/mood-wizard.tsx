"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"
import { HabitWithStats } from "@/lib/types"

interface MoodWizardProps {
  onSuccessCallback: (data: HabitWithStats[]) => void
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

export function MoodWizard({ trigger, onSuccessCallback }: MoodWizardProps) {
  const [step, setStep] = useState(1)
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [loading, setLoading] = useState<boolean>(false)
  const [open, setOpen] = useState<boolean>(false)

  useEffect(() => {
    fetchHabits()
    checkMoodEntry()
  }, [])

  const checkMoodEntry = async () => {
    try {
      const today = new Date().toISOString().split("T")[0]
      const response = await fetch(`/api/mood?date=${today}`)
      const entry = await response.json()

      if (!entry) {
        setOpen(true)
      }
    } catch (error) {
      console.error("Error checking mood entry:", error)
    }
  }

  const fetchHabits: () => Promise<void> = async () => {
    try {
      const response = await axios.get("/api/habits")

      const habitsWithStats: HabitWithStats[] = await Promise.all(
        response.data.map(async (habit: any) => {
          const statsResponse = await axios.get(
            `/api/habits/${habit.id}/stats`
          )
          return await statsResponse.data
        }),
      )
      onSuccessCallback(habitsWithStats)
      
    } catch (error) {
      console.error("Error fetching habits:", error)
    } finally {
      setLoading(false)
    }
  }

  const { toast } = useToast()

  const handleMoodSelect = (moodType: string) => {
    setSelectedMood(moodType)
  }

  const handleLevelSelect = (level: string) => {
    setSelectedLevel(level)
  }

  const handleSubmit = async () => {
    if (!selectedMood || !selectedLevel) return

    setIsSubmitting(true)

    try {
      const response = await axios.post("/api/mood", {
        mood_type: selectedMood,
        mood_level: selectedLevel,
        entry_date: new Date().toISOString().split("T")[0],
      })

      if (response.data) {
        toast({
          title: "✅ Mood registrado!",
          description: "Your mood has been saved successfully.",
        })
        
        setOpen((prev) => !prev)
      } else {
        throw new Error("Failed to save mood")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save your mood. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedMoodData = 
    MOOD_OPTIONS.find((m) => m.type === selectedMood)

  const moodLevels = 
    selectedMood 
    ? MOOD_LEVELS[selectedMood as keyof typeof MOOD_LEVELS] 
    : []

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
                How are you feeling today?
              </h2>
              <p className="text-muted-foreground mb-8 text-sm">
                Select to learn more
              </p>

              <div className="grid grid-cols-3 gap-3 mb-8">
                {MOOD_OPTIONS.slice(0, 3).map((mood) => (
                  <button
                    key={mood.type}
                    onClick={() => handleMoodSelect(mood.type)}
                    className={`py-3 px-4 rounded-xl font-medium transition-all text-sm ${
                      selectedMood === mood.type
                        ? "bg-primary text-primary-foreground shadow-lg scale-105"
                        : "bg-muted text-foreground hover:bg-muted/80"
                    }`}
                  >
                    {mood.label}
                  </button>
                ))}
              </div>

              {selectedMood && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="rounded-3xl p-12 mb-6 flex items-center justify-center"
                  style={{ backgroundColor: selectedMoodData?.color }}
                >
                  <span className="text-9xl">{selectedMoodData?.emoji}</span>
                </motion.div>
              )}

              {!selectedMood && (
                <div className="rounded-3xl bg-yellow-400 p-12 mb-6 flex items-center justify-center">
                  <span className="text-9xl">😊</span>
                </div>
              )}

              <Button
                onClick={() => setStep(2)}
                disabled={!selectedMood}
                className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-full py-6 text-base font-semibold"
              >
                Get Started
              </Button>

              <p className="text-center text-sm text-muted-foreground mt-4">
                Already have an account? <span className="underline cursor-pointer">Log in</span>
              </p>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="relative min-h-[600px] flex flex-col"
              style={{ backgroundColor: selectedMoodData?.color || "#FCD34D" }}
            >
              <div className="flex items-center justify-between p-6">
                <Button
                  variant="ghost"
                  onClick={() => setStep(1)}
                  className="rounded-full w-10 h-10 p-0 bg-white/20 hover:bg-white/30"
                >
                  ←
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!selectedLevel || isSubmitting}
                  className="rounded-full px-6 bg-white/20 hover:bg-white/30 text-foreground font-semibold"
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
              </div>

              <div className="flex-1 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-9xl"
                >
                  {selectedMoodData?.emoji}
                </motion.div>
              </div>

              <div className="bg-background rounded-t-3xl p-8">
                <h2 className="text-3xl font-bold text-foreground mb-2 text-balance">Select your today's mood</h2>

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
                    <button
                      key={level.level}
                      onClick={() => handleLevelSelect(level.level)}
                      className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all text-sm ${
                        selectedLevel === level.level
                          ? "shadow-lg scale-105"
                          : "bg-muted text-foreground hover:bg-muted/80"
                      }`}
                      style={
                        selectedLevel === level.level ? { backgroundColor: selectedMoodData?.color, color: "#000" } : {}
                      }
                    >
                      {level.label}
                    </button>
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
