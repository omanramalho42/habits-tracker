"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Star, Zap, Trophy } from "lucide-react"

interface XPGainEvent {
  id: string
  amount: number
  source: string
  timestamp: number
}

interface XPBarProps {
  level: number
  currentXP: number
  xpToNextLevel: number
  totalXP: number
  xpPerLevel: number
  recentGains: XPGainEvent[]
  leveledUp: boolean
}

export function XPBar({
  level,
  currentXP,
  xpToNextLevel,
  totalXP,
  xpPerLevel,
  recentGains,
  leveledUp,
}: XPBarProps) {
  const progress = (currentXP / xpPerLevel) * 100

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="fixed left-1/2 top-4 z-50 -translate-x-1/2"
    >
      {/* Level Up Celebration */}
      <AnimatePresence>
        {leveledUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -20 }}
            className="absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap"
          >
            <div className="flex items-center gap-2 rounded-full border border-yellow-500/50 bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-orange-500/20 px-4 py-2 backdrop-blur-xl">
              <Trophy className="size-5 text-yellow-400" />
              <span className="bg-gradient-to-r from-yellow-300 to-amber-400 bg-clip-text font-bold text-transparent">
                Level Up!
              </span>
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 10, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                <Star className="size-5 fill-yellow-400 text-yellow-400" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* XP Gain Floating Numbers */}
      <div className="absolute -right-4 top-0 h-full w-32">
        <AnimatePresence>
          {recentGains.map((gain) => (
            <motion.div
              key={gain.id}
              initial={{ opacity: 0, y: 0, x: 0 }}
              animate={{ opacity: [0, 1, 1, 0], y: -60, x: 20 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute right-0 top-0 flex items-center gap-1 whitespace-nowrap"
            >
              <Zap className="size-4 text-yellow-400" />
              <span className="font-bold text-yellow-300">+{gain.amount} XP</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Main XP Bar Container */}
      <div className="relative flex items-center gap-3 rounded-2xl border border-[#ff5a3d]/30 bg-[#0d0808]/90 px-4 py-2.5 backdrop-blur-xl shadow-[0_0_30px_rgba(255,90,61,0.15)]">
        {/* Glow effect */}
        <div className="absolute -inset-1 -z-10 rounded-2xl bg-gradient-to-r from-[#ff3d1d]/20 via-[#ff5a3d]/10 to-[#ff3d1d]/20 blur-xl" />
        
        {/* Level Badge */}
        <motion.div
          key={level}
          initial={{ scale: 1.5, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative flex size-10 items-center justify-center"
        >
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#ff5a3d] to-[#cc3311] shadow-[0_0_15px_rgba(255,90,61,0.5)]" />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/20 to-transparent" />
          <span className="relative text-lg font-bold text-white">{level}</span>
        </motion.div>

        {/* XP Progress Section */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-medium text-[#ff8a70]/80">Level {level}</span>
            <span className="text-xs text-[#ff8a70]/60">
              {currentXP}/{xpPerLevel} XP
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="relative h-2 w-36 overflow-hidden rounded-full bg-[#1a0808]">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#ff3d1d]/10 to-[#ff5a3d]/10" />
            
            {/* Progress fill */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="relative h-full rounded-full bg-gradient-to-r from-[#ff5a3d] via-[#ff6b4a] to-[#ff8a70]"
            >
              {/* Shine effect */}
              <motion.div
                animate={{
                  x: ["-100%", "200%"],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                  repeatDelay: 1,
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              />
            </motion.div>
          </div>
        </div>

        {/* Total XP */}
        <div className="flex flex-col items-center border-l border-[#ff5a3d]/20 pl-3">
          <Star className="size-4 text-[#ff8a70]" />
          <span className="text-xs font-bold text-[#ffa590]">{totalXP}</span>
        </div>
      </div>
    </motion.div>
  )
}
