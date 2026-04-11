"use client"

import { useState, useCallback, useEffect } from "react"

interface XPState {
  currentXP: number
  level: number
  xpToNextLevel: number
  totalXP: number
}

interface XPGainEvent {
  id: string
  amount: number
  source: string
  timestamp: number
}

const XP_PER_LEVEL = 100
const STORAGE_KEY = "emoji-app-xp"

function calculateLevel(totalXP: number): { level: number; currentXP: number; xpToNextLevel: number } {
  const level = Math.floor(totalXP / XP_PER_LEVEL) + 1
  const currentXP = totalXP % XP_PER_LEVEL
  const xpToNextLevel = XP_PER_LEVEL - currentXP
  return { level, currentXP, xpToNextLevel }
}

export function useXP() {
  const [state, setState] = useState<XPState>({
    currentXP: 0,
    level: 1,
    xpToNextLevel: XP_PER_LEVEL,
    totalXP: 0,
  })
  
  const [recentGains, setRecentGains] = useState<XPGainEvent[]>([])
  const [leveledUp, setLeveledUp] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          const { level, currentXP, xpToNextLevel } = calculateLevel(parsed.totalXP)
          setState({
            totalXP: parsed.totalXP,
            level,
            currentXP,
            xpToNextLevel,
          })
        } catch {
          // Invalid data, start fresh
        }
      }
    }
  }, [])

  // Save to localStorage on change
  useEffect(() => {
    if (typeof window !== "undefined" && state.totalXP > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ totalXP: state.totalXP }))
    }
  }, [state.totalXP])

  const addXP = useCallback((amount: number, source: string) => {
    setState(prev => {
      const newTotalXP = prev.totalXP + amount
      const { level, currentXP, xpToNextLevel } = calculateLevel(newTotalXP)
      
      // Check for level up
      if (level > prev.level) {
        setLeveledUp(true)
        setTimeout(() => setLeveledUp(false), 3000)
      }
      
      return {
        totalXP: newTotalXP,
        level,
        currentXP,
        xpToNextLevel,
      }
    })

    // Add to recent gains for animation
    const gainEvent: XPGainEvent = {
      id: `${Date.now()}-${Math.random()}`,
      amount,
      source,
      timestamp: Date.now(),
    }
    
    setRecentGains(prev => [...prev, gainEvent])
    
    // Remove after animation
    setTimeout(() => {
      setRecentGains(prev => prev.filter(g => g.id !== gainEvent.id))
    }, 2000)
  }, [])

  const resetXP = useCallback(() => {
    setState({
      currentXP: 0,
      level: 1,
      xpToNextLevel: XP_PER_LEVEL,
      totalXP: 0,
    })
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  return {
    ...state,
    addXP,
    resetXP,
    recentGains,
    leveledUp,
    xpPerLevel: XP_PER_LEVEL,
  }
}

// XP rewards for different actions
export const XP_REWARDS = {
  CREATE_EMOJI: 25,
  SELECT_EMOJI: 5,
  GENERATE_AI: 15,
  FIRST_EMOJI: 50,
  STREAK_BONUS: 10,
  LEVEL_UP_BONUS: 100,
}
