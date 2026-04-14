"use client"

import { createContext, useContext, ReactNode } from "react"
import { useSound } from "@/hooks/use-sound"

interface SoundContextType {
  playSound: (type: "click" | "hover" | "success" | "notification" | "error" | "toggle") => void
  isEnabled: boolean
  toggleSound: () => void
}

const SoundContext = createContext<SoundContextType | null>(null)

export function SoundProvider({ children }: { children: ReactNode }) {
  const sound = useSound()

  return (
    <SoundContext.Provider value={sound}>
      {children}
    </SoundContext.Provider>
  )
}

export function useSoundContext() {
  const context = useContext(SoundContext)
  if (!context) {
    throw new Error("useSoundContext must be used within a SoundProvider")
  }
  return context
}
