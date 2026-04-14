"use client"

import { useEffect, useState, useContext } from "react"
import { X, UserPlus } from "lucide-react"

const NAMES = [
  "Joao S.",
  "Maria L.",
  "Pedro H.",
  "Ana C.",
  "Lucas M.",
  "Julia R.",
  "Gabriel F.",
  "Beatriz A.",
  "Rafael N.",
  "Camila P.",
  "Thiago B.",
  "Larissa G.",
  "Diego O.",
  "Fernanda T.",
  "Bruno K.",
  "Isabela V.",
  "Matheus D.",
  "Carolina E.",
  "Gustavo W.",
  "Amanda Z.",
  "Leonardo M.",
  "Mariana S.",
  "Felipe R.",
  "Juliana C.",
  "Andre L.",
]

const CITIES = [
  "Sao Paulo",
  "Rio de Janeiro",
  "Belo Horizonte",
  "Curitiba",
  "Porto Alegre",
  "Salvador",
  "Brasilia",
  "Fortaleza",
  "Recife",
  "Manaus",
  "Florianopolis",
  "Goiania",
  "Vitoria",
  "Natal",
  "Campinas",
]

// Simple sound function that doesn't require context
function playNotificationSound() {
  if (typeof window === "undefined") return
  
  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    
    if (audioContext.state === "suspended") {
      audioContext.resume()
    }
    
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.type = "square"
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.05)
    oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.1)
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15)
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.15)
  } catch {
    // Silently fail if audio is not supported
  }
}

export function SignupToast() {
  const [isVisible, setIsVisible] = useState(false)
  const [notification, setNotification] = useState({ name: "", city: "", time: "" })
  const [soundEnabled, setSoundEnabled] = useState(true)

  useEffect(() => {
    // Check sound preference
    const stored = localStorage.getItem("labhabit-sounds")
    if (stored !== null) {
      setSoundEnabled(stored === "true")
    }

    const showNotification = () => {
      const name = NAMES[Math.floor(Math.random() * NAMES.length)]
      const city = CITIES[Math.floor(Math.random() * CITIES.length)]
      const minutes = Math.floor(Math.random() * 5) + 1

      setNotification({
        name,
        city,
        time: `${minutes} min atras`,
      })
      setIsVisible(true)
      
      // Check current sound preference
      const currentPref = localStorage.getItem("labhabit-sounds")
      if (currentPref !== "false") {
        playNotificationSound()
      }

      setTimeout(() => {
        setIsVisible(false)
      }, 5000)
    }

    // Show first notification after 5 seconds
    const initialTimeout = setTimeout(showNotification, 5000)

    // Then show every 10-18 seconds
    const interval = setInterval(() => {
      showNotification()
    }, Math.random() * 8000 + 10000)

    return () => {
      clearTimeout(initialTimeout)
      clearInterval(interval)
    }
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed top-4 left-4 z-50 animate-in slide-in-from-left-5 fade-in duration-300">
      <div className="bg-card border-2 border-primary/50 rounded-sm p-4 pr-10 shadow-lg glow-primary max-w-sm relative overflow-hidden">
        {/* Pixel corners */}
        <div className="absolute top-0 left-0 w-3 h-3 bg-primary" />
        <div className="absolute top-0 right-0 w-3 h-3 bg-primary" />
        <div className="absolute bottom-0 left-0 w-3 h-3 bg-primary" />
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary" />
        
        {/* Scanline effect */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="h-[2px] bg-primary/30"
              style={{ marginTop: `${i * 4}px` }}
            />
          ))}
        </div>

        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-sm bg-primary/20 border-2 border-primary flex items-center justify-center animate-pulse">
            <UserPlus className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-foreground font-medium font-mono">
              <span className="text-primary font-bold">{notification.name}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              de <span className="text-accent">{notification.city}</span>
            </p>
            <p className="text-[10px] text-primary/80 font-mono mt-1">
              [+] cadastrou-se agora
            </p>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3 h-1 bg-secondary/50 rounded-sm overflow-hidden">
          <div 
            className="h-full bg-primary"
            style={{
              animation: "shrink 5s linear forwards",
            }}
          />
        </div>
      </div>
      
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}
