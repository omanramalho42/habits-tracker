"use client"

import { useCallback, useRef, useEffect, useState } from "react"

// Audio context for generating sounds
let audioContext: AudioContext | null = null

const getAudioContext = () => {
  if (typeof window === "undefined") return null
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  }
  return audioContext
}

type SoundType = "click" | "hover" | "success" | "notification" | "error" | "toggle" | "pop" | "levelUp"

interface SoundConfig {
  frequency: number
  duration: number
  type: OscillatorType
  volume: number
  attack?: number
  decay?: number
}

const soundConfigs: Record<SoundType, SoundConfig> = {
  click: {
    frequency: 800,
    duration: 0.08,
    type: "square",
    volume: 0.15,
    attack: 0.01,
    decay: 0.07,
  },
  hover: {
    frequency: 600,
    duration: 0.05,
    type: "sine",
    volume: 0.08,
    attack: 0.01,
    decay: 0.04,
  },
  success: {
    frequency: 880,
    duration: 0.2,
    type: "square",
    volume: 0.12,
    attack: 0.02,
    decay: 0.18,
  },
  notification: {
    frequency: 1000,
    duration: 0.15,
    type: "square",
    volume: 0.18,
    attack: 0.01,
    decay: 0.14,
  },
  error: {
    frequency: 200,
    duration: 0.3,
    type: "sawtooth",
    volume: 0.15,
    attack: 0.01,
    decay: 0.29,
  },
  toggle: {
    frequency: 440,
    duration: 0.06,
    type: "triangle",
    volume: 0.1,
    attack: 0.01,
    decay: 0.05,
  },
  pop: {
    frequency: 400,
    duration: 0.1,
    type: "sine",
    volume: 0.2,
    attack: 0.01,
    decay: 0.09,
  },
  levelUp: {
    frequency: 600,
    duration: 0.5,
    type: "triangle",
    volume: 0.15,
    attack: 0.05,
    decay: 0.4,
  },
}

export function useSound() {
  const [isEnabled, setIsEnabled] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const lastPlayTime = useRef<Record<string, number>>({})

  useEffect(() => {
    setIsMounted(true)
    // Check local storage for sound preference
    const stored = localStorage.getItem("labhabit-sounds")
    if (stored !== null) {
      setIsEnabled(stored === "true")
    }
  }, [])

  const toggleSound = useCallback(() => {
    setIsEnabled((prev) => {
      const newValue = !prev
      localStorage.setItem("labhabit-sounds", String(newValue))
      return newValue
    })
  }, [])

  const playSound = useCallback(
    (type: SoundType) => {
      if (!isMounted || !isEnabled) return

      // Debounce - prevent playing the same sound too quickly
      const now = Date.now()
      if (lastPlayTime.current[type] && now - lastPlayTime.current[type] < 50) {
        return
      }
      lastPlayTime.current[type] = now

      const ctx = getAudioContext()
      if (!ctx) return

      // Resume audio context if suspended
      if (ctx.state === "suspended") {
        ctx.resume()
      }

      const config = soundConfigs[type]
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.type = config.type
      oscillator.frequency.setValueAtTime(config.frequency, ctx.currentTime)

      // For success sound, add a second tone
      if (type === "success") {
        oscillator.frequency.setValueAtTime(880, ctx.currentTime)
        oscillator.frequency.setValueAtTime(1100, ctx.currentTime + 0.08)
      }

      // For notification, add melody
      if (type === "notification") {
        oscillator.frequency.setValueAtTime(800, ctx.currentTime)
        oscillator.frequency.setValueAtTime(1000, ctx.currentTime + 0.05)
        oscillator.frequency.setValueAtTime(1200, ctx.currentTime + 0.1)
      }

      // Dentro de playSound(type: SoundType)
      if (type === "levelUp") {
        // Melodia ascendente rápida
        oscillator.frequency.setValueAtTime(440, ctx.currentTime) // Lá
        oscillator.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2) // Lá (oitava acima)
        oscillator.frequency.exponentialRampToValueAtTime(1318, ctx.currentTime + 0.5) // Mi (nota de conclusão)
      }

      // Envelope
      gainNode.gain.setValueAtTime(0, ctx.currentTime)
      gainNode.gain.linearRampToValueAtTime(config.volume, ctx.currentTime + (config.attack || 0.01))
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + config.duration)

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + config.duration)
    },
    [isEnabled, isMounted]
  )

  return {
    playSound,
    isEnabled,
    toggleSound,
  }
}
