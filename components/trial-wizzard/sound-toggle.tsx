"use client"

import { Volume2, VolumeX } from "lucide-react"
import { useSoundContext } from "./sound-provider"

export function SoundToggle() {
  const { isEnabled, toggleSound, playSound } = useSoundContext()

  const handleClick = () => {
    toggleSound()
    if (!isEnabled) {
      // Will play on the new enabled state
      setTimeout(() => playSound("toggle"), 50)
    }
  }

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-4 right-4 z-50 w-12 h-12 bg-card border border-border/30 rounded-sm flex items-center justify-center hover:border-primary/50 transition-all hover:glow-primary group"
      aria-label={isEnabled ? "Desativar sons" : "Ativar sons"}
    >
      {isEnabled ? (
        <Volume2 className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
      ) : (
        <VolumeX className="w-5 h-5 text-muted-foreground group-hover:scale-110 transition-transform" />
      )}
      <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] bg-card border border-border/30 px-2 py-1 rounded-sm text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {isEnabled ? "Sons ON" : "Sons OFF"}
      </span>
    </button>
  )
}
