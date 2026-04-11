"use client"

import { useCallback, useRef } from "react"

// Audio context singleton para evitar multiplas instancias
let audioContext: AudioContext | null = null

function getAudioContext() {
  if (!audioContext && typeof window !== "undefined") {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  }
  return audioContext
}

type SoundType = 
  | "click"
  | "hover"
  | "success"
  | "error"
  | "xpGain"
  | "levelUp"
  | "select"
  | "create"
  | "whoosh"
  | "pop"
  | "chime"

interface SoundConfig {
  frequency: number
  duration: number
  type: OscillatorType
  volume: number
  attack?: number
  decay?: number
  frequencies?: number[]
  delays?: number[]
}

const soundConfigs: Record<SoundType, SoundConfig> = {
  click: {
    frequency: 600,
    duration: 0.08,
    type: "sine",
    volume: 0.15,
    attack: 0.01,
    decay: 0.07,
  },
  hover: {
    frequency: 800,
    duration: 0.05,
    type: "sine",
    volume: 0.08,
    attack: 0.005,
    decay: 0.045,
  },
  success: {
    frequency: 523.25,
    duration: 0.4,
    type: "sine",
    volume: 0.2,
    frequencies: [523.25, 659.25, 783.99],
    delays: [0, 0.1, 0.2],
  },
  error: {
    frequency: 200,
    duration: 0.3,
    type: "sawtooth",
    volume: 0.15,
    attack: 0.01,
    decay: 0.29,
  },
  xpGain: {
    frequency: 880,
    duration: 0.25,
    type: "sine",
    volume: 0.18,
    frequencies: [880, 1100, 1320],
    delays: [0, 0.05, 0.1],
  },
  levelUp: {
    frequency: 440,
    duration: 0.6,
    type: "sine",
    volume: 0.25,
    frequencies: [440, 554.37, 659.25, 880],
    delays: [0, 0.1, 0.2, 0.35],
  },
  select: {
    frequency: 700,
    duration: 0.1,
    type: "sine",
    volume: 0.12,
    attack: 0.01,
    decay: 0.09,
  },
  create: {
    frequency: 523.25,
    duration: 0.5,
    type: "sine",
    volume: 0.2,
    frequencies: [523.25, 659.25, 783.99, 1046.5],
    delays: [0, 0.08, 0.16, 0.28],
  },
  whoosh: {
    frequency: 400,
    duration: 0.2,
    type: "sine",
    volume: 0.1,
    attack: 0.02,
    decay: 0.18,
  },
  pop: {
    frequency: 1000,
    duration: 0.06,
    type: "sine",
    volume: 0.15,
    attack: 0.005,
    decay: 0.055,
  },
  chime: {
    frequency: 1200,
    duration: 0.3,
    type: "sine",
    volume: 0.15,
    frequencies: [1200, 1500, 1800],
    delays: [0, 0.08, 0.16],
  },
}

export function useSound() {
  const isEnabledRef = useRef(true)

  const playTone = useCallback((
    frequency: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    attack = 0.01,
    decay?: number,
    delay = 0
  ) => {
    const ctx = getAudioContext()
    if (!ctx || !isEnabledRef.current) return

    // Resume context if suspended (needed for user interaction requirement)
    if (ctx.state === "suspended") {
      ctx.resume()
    }

    const startTime = ctx.currentTime + delay
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, startTime)

    // ADSR envelope
    gainNode.gain.setValueAtTime(0, startTime)
    gainNode.gain.linearRampToValueAtTime(volume, startTime + attack)
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.start(startTime)
    oscillator.stop(startTime + duration + 0.1)
  }, [])

  const play = useCallback((soundType: SoundType) => {
    const config = soundConfigs[soundType]
    if (!config) return

    // Multi-tone sounds (chords/arpeggios)
    if (config.frequencies && config.delays) {
      config.frequencies.forEach((freq, i) => {
        playTone(
          freq,
          config.duration,
          config.type,
          config.volume * (1 - i * 0.15), // Diminuindo volume para cada nota
          config.attack,
          config.decay,
          config.delays![i]
        )
      })
    } else {
      // Single tone
      playTone(
        config.frequency,
        config.duration,
        config.type,
        config.volume,
        config.attack,
        config.decay
      )
    }
  }, [playTone])

  const setEnabled = useCallback((enabled: boolean) => {
    isEnabledRef.current = enabled
  }, [])

  return { play, setEnabled }
}
