"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Sparkles, Gamepad2, Mic2, Flame } from "lucide-react"
import { Providers } from "@/components/v2/providers"
import { EmojiSuggestions } from "@/components/v2/emoji-suggestion"
import { JackpotGame } from "@/components/v2/jackpot-game"
import { VoiceAssistant } from "@/components/v2/voice-assistent.ai"
import { StreakCelebration } from "@/components/v2/streak-celebration"

type View = "emoji" | "jackpot" | "voice" | "streak"

export default function Home() {
  const [currentView, setCurrentView] = useState<View>("emoji")

  return (
    <Providers>
      <main className="relative min-h-screen">
        {/* Navigation Toggle */}
        <div className="fixed right-4 top-4 z-50 flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentView("emoji")}
            className={`
              flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium
              backdrop-blur-xl transition-all duration-300
              ${currentView === "emoji"
                ? "border border-[#ff5a3d]/50 bg-[#ff5a3d]/20 text-[#ff8a70] shadow-[0_0_20px_rgba(255,90,61,0.3)]"
                : "border border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
              }
            `}
          >
            <Sparkles className="size-4" />
            Emojis
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentView("jackpot")}
            className={`
              flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium
              backdrop-blur-xl transition-all duration-300
              ${currentView === "jackpot"
                ? "border border-[#7c3aed]/50 bg-[#7c3aed]/20 text-[#a78bfa] shadow-[0_0_20px_rgba(124,58,237,0.3)]"
                : "border border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
              }
            `}
          >
            <Gamepad2 className="size-4" />
            JackPot
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentView("voice")}
            className={`
              flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium
              backdrop-blur-xl transition-all duration-300
              ${currentView === "voice"
                ? "border border-blue-500/50 bg-blue-500/20 text-blue-300 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                : "border border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
              }
            `}
          >
            <Mic2 className="size-4" />
            Voice
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentView("streak")}
            className={`
              flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium
              backdrop-blur-xl transition-all duration-300
              ${currentView === "streak"
                ? "border border-orange-500/50 bg-orange-500/20 text-orange-300 shadow-[0_0_20px_rgba(249,115,22,0.3)]"
                : "border border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
              }
            `}
          >
            <Flame className="size-4" />
            Streak
          </motion.button>
        </div>
        
        <div className="">
          {/* View Content */}
          {currentView === "emoji" && <EmojiSuggestions />}
          {currentView === "jackpot" && <JackpotGame />}
          {currentView === "voice" && <VoiceAssistant />}
          {currentView === "streak" && (
            <div className="flex min-h-screen items-center justify-center bg-[#0d0d0d]">
              <StreakCelebration />
            </div>
          )}
        </div>
      </main>
    </Providers>
  )
}
