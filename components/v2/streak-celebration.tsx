"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, Flame } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog"

// Particle component for fire/ember effect
function FireParticle({ delay, x, size }: { delay: number; x: number; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        bottom: 0,
        background: `radial-gradient(circle, rgba(255,${100 + Math.random() * 50},0,0.8) 0%, rgba(255,${50 + Math.random() * 50},0,0) 70%)`,
      }}
      initial={{ y: 0, opacity: 0, scale: 0 }}
      animate={{
        y: [-20, -80 - Math.random() * 60],
        opacity: [0, 1, 0],
        scale: [0, 1, 0.5],
      }}
      transition={{
        duration: 2 + Math.random() * 1.5,
        delay: delay,
        repeat: Infinity,
        ease: "easeOut",
      }}
    />
  )
}

// Flame SVG icon matching the design
function FlameIcon() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="size-24"
      fill="none"
    >
      <defs>
        <linearGradient id="flameGradient" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#ff4500" />
          <stop offset="50%" stopColor="#ff6b35" />
          <stop offset="100%" stopColor="#ffa500" />
        </linearGradient>
        <linearGradient id="innerFlameGradient" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#ff6b35" />
          <stop offset="100%" stopColor="#ffcc00" />
        </linearGradient>
      </defs>
      {/* Outer flame */}
      <motion.path
        d="M50 5 C30 25 15 45 20 65 C25 85 40 95 50 95 C60 95 75 85 80 65 C85 45 70 25 50 5"
        fill="url(#flameGradient)"
        initial={{ scale: 0.95 }}
        animate={{ scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Inner flame */}
      <motion.path
        d="M50 30 C40 45 35 55 38 70 C41 80 46 85 50 85 C54 85 59 80 62 70 C65 55 60 45 50 30"
        fill="url(#innerFlameGradient)"
        initial={{ scale: 0.9, y: 0 }}
        animate={{ scale: [0.9, 1, 0.9], y: [0, -2, 0] }}
        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  )
}

export function StreakCelebration() {
  const [isOpen, setIsOpen] = useState(false)
  const streakDays = 30
  const streakNumber = 96

  // Generate particles
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    delay: Math.random() * 2,
    x: Math.random() * 100,
    size: 3 + Math.random() * 5,
  }))

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="
            relative flex items-center gap-3 overflow-hidden rounded-2xl
            bg-gradient-to-r from-[#ff4500]/20 via-[#ff6b35]/20 to-[#ff8c00]/20
            border border-[#ff4500]/30 px-6 py-4
            text-white font-semibold
            shadow-[0_0_30px_rgba(255,69,0,0.3)]
            backdrop-blur-xl
            transition-all duration-300
            hover:border-[#ff4500]/50
            hover:shadow-[0_0_40px_rgba(255,69,0,0.5)]
          "
        >
          <Flame className="size-6 text-orange-400" />
          <span className="text-lg">Ver Streak</span>
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          />
        </motion.button>
      </DialogTrigger>

      <DialogContent 
        showCloseButton={false}
        aria-describedby={undefined}
        className="
          border-0 bg-transparent p-0 shadow-none
          max-w-md w-full
        "
      >
        <DialogTitle className="sr-only">Streak Celebration</DialogTitle>
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="
              relative overflow-hidden rounded-3xl
              bg-gradient-to-br from-[#1a1a1a] via-[#2d1810] to-[#1a1a1a]
              border border-white/5
              shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)]
            "
          >
            {/* Fire particles background */}
            <div className="absolute inset-0 overflow-hidden">
              {particles.map((particle) => (
                <FireParticle
                  key={particle.id}
                  delay={particle.delay}
                  x={particle.x}
                  size={particle.size}
                />
              ))}
            </div>

            {/* Gradient overlay for fire effect */}
            <div 
              className="absolute inset-0"
              style={{
                background: `
                  radial-gradient(ellipse at 50% 120%, rgba(255,69,0,0.15) 0%, transparent 50%),
                  radial-gradient(ellipse at 80% 80%, rgba(255,100,0,0.1) 0%, transparent 40%)
                `,
              }}
            />

            {/* Large background number */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 0.08, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="
                absolute left-4 top-1/2 -translate-y-1/2
                text-[140px] font-bold leading-none text-white
                select-none pointer-events-none
              "
              style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
            >
              {streakNumber}
            </motion.div>

            {/* Main content */}
            <div className="relative z-10 flex items-center justify-between px-8 py-10">
              {/* Text content */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="flex flex-col items-center text-center flex-1"
              >
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.4 }}
                  className="text-2xl font-bold text-white mb-2"
                >
                  You&apos;re on fire!
                </motion.h2>
                
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="text-[#a0a0a0] text-base leading-relaxed max-w-[200px]"
                >
                  {streakDays}-day music streak! You didn&apos;t skip a single beat.
                </motion.p>

                {/* Share button */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  whileHover={{ scale: 1.05, x: 3 }}
                  whileTap={{ scale: 0.95 }}
                  className="
                    mt-6 flex items-center gap-1
                    rounded-full bg-white/10 backdrop-blur-sm
                    px-6 py-2.5
                    text-white font-medium text-sm
                    border border-white/10
                    transition-all duration-300
                    hover:bg-white/15 hover:border-white/20
                  "
                  onClick={() => {
                    // Share functionality
                    if (navigator.share) {
                      navigator.share({
                        title: "My Music Streak!",
                        text: `I'm on a ${streakDays}-day music streak! 🔥`,
                      })
                    }
                  }}
                >
                  Share
                  <ChevronRight className="size-4" />
                </motion.button>
              </motion.div>

              {/* Flame icon */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 0.25, type: "spring", stiffness: 200 }}
                className="absolute right-4 bottom-4"
              >
                <FlameIcon />
              </motion.div>
            </div>

            {/* Bottom glow effect */}
            <div 
              className="absolute bottom-0 left-0 right-0 h-1/2 pointer-events-none"
              style={{
                background: "linear-gradient(to top, rgba(255,69,0,0.1) 0%, transparent 100%)",
              }}
            />
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
