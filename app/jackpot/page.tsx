"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence, useAnimation } from "framer-motion"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { HelpCircle, Trophy, Sparkles } from "lucide-react"
import type { Player, GameResult } from "@/app/api/game/route"
import { Habit } from "@prisma/client"
import { toast } from "sonner"
import { useSound } from "@/hooks/use-sound"
import HeaderNavigation from "@/components/header/header-navigation"

// Slot symbols using emojis as fallback
const SLOT_SYMBOLS = ["🍒", "🍋", "🍊", "🍇", "🍎", "🥝", "🍑", "🫐", "🍓", "🍌", "🥭", "🍍"]

async function fetchHabits(): Promise<Habit[]> {
  const res = await fetch("/api/habits")
  if (!res.ok) throw new Error("Failed to fetch habits")
  return res.json()
}

async function fetchLeaderboard(): Promise<{ players: Player[]; userScore: number }> {
  const res = await fetch("/api/game")
  if (!res.ok) throw new Error("Failed to fetch leaderboard")
  return res.json()
}

async function playGame(): Promise<GameResult> {
  const res = await fetch("/api/game", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "spin" }), // Não precisa enviar o array 'habits' aqui
  })
  if (!res.ok) {
     const errorData = await res.json();
     throw new Error(errorData.error || "Failed to play");
  }
  return res.json()
}

type Screen = "game" | "leaderboard"

export default function JackpotGame() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("game")
  const [isSpinning, setIsSpinning] = useState(false)
  const [reelPositions, setReelPositions] = useState([[0, 1, 2], [3, 4, 5], [6, 7, 8]])
  const [gameResult, setGameResult] = useState<GameResult | null>(null)
  const [showResult, setShowResult] = useState(false)
  const queryClient = useQueryClient()

  const { data: habits = [] } = useQuery({
    queryKey: ["habits"],
    queryFn: fetchHabits,
  })

  const { data: leaderboardData } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: fetchLeaderboard,
  })
  // 2. Inicialize o som
  const { play } = useSound()

  const canPlay = habits.length >= 10; 
  // No spinMutation, precisamos parar o som
  const spinMutation = useMutation({
    mutationFn: () => playGame(),
    onSuccess: (result) => {
      setGameResult(result);
      setReelPositions(result.reels);
      
      setTimeout(() => {
        setIsSpinning(false);
        setShowResult(true);
        
        // 🔇 PARAR SOM DE ROLETA e tocar o final
        // stop("roulette") // Se o seu hook permitir stop
        
        if (result.isWin) {
          play("success")
        } else {
          play("pop") 
        }
      }, 2800);
      
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
    onError: (error: any) => {
      setIsSpinning(false);
      // 🔇 PARAR SOM DE ROLETA
      play("error")
      toast.error(error.message); 
    }
  });

  const handleSpin = useCallback(() => {
    if (!canPlay) {
      play("error")
      return
    }
    if (isSpinning) return

    play("click") 
    
    // 🔊 SOM DE ROLETA (Loop)
    // Se o seu useSound retornar o objeto de áudio ou tiver um método de stop, use-o.
    // Caso contrário, você pode disparar um som de "giro rápido" aqui.
    play("levelUp") // <--- Adicionado som de roleta constante
    
    setIsSpinning(true)
    setShowResult(false)
    setGameResult(null)
    spinMutation.mutate()
  }, [canPlay, isSpinning, spinMutation, play])

  // Dentro do componente JackpotGame
  const getSymbol = (index: number) => {
    const habit = habits[index];
    
    // Se o hábito tiver um emoji cadastrado no banco, usa ele
    if (habit && habit.emoji) {
      return habit.emoji;
    }
    
    // Fallback para os símbolos padrão caso o hábito não tenha emoji
    return SLOT_SYMBOLS[index % SLOT_SYMBOLS.length];
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0a0a12]">
      <HeaderNavigation />
      {/* Deep gradient background */}
      <div className="absolute inset-0 bg-linear-to-b from-[#12121f] via-[#0d0d18] to-[#080810]" />
      
      {/* Purple/blue radial glow */}
      <div className="absolute left-1/2 top-1/4 h-125 w-150 -translate-x-1/2 -translate-y-1/2">
        <div className="absolute inset-0 rounded-full bg-gradient-radial from-[#6b21a8]/15 via-[#4c1d95]/8 to-transparent blur-3xl" />
        <div className="absolute inset-0 rounded-full bg-gradient-radial from-[#7c3aed]/10 via-transparent to-transparent blur-2xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 top-20 flex min-h-screen flex-col">
        {/* Screen Content */}
        <AnimatePresence mode="wait">
          {currentScreen === "game" ? (
            <GameScreen
              key="game"
              habits={habits}
              canPlay={canPlay}
              isSpinning={isSpinning}
              reelPositions={reelPositions}
              gameResult={gameResult}
              showResult={showResult}
              onSpin={handleSpin}
              getSymbol={getSymbol}
            />
          ) : (
            <LeaderboardScreen
              key="leaderboard"
              players={leaderboardData?.players || []}
              userScore={leaderboardData?.userScore || 0}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function GameScreen({
  habits,
  canPlay,
  isSpinning,
  reelPositions,
  gameResult,
  showResult,
  onSpin,
  getSymbol,
}: {
  habits: Habit[]
  canPlay: boolean
  isSpinning: boolean
  reelPositions: number[][]
  gameResult: GameResult | null
  showResult: boolean
  onSpin: () => void
  getSymbol: (index: number) => string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="flex flex-1 flex-col items-center px-4"
    >
      {/* Slot Machine Container */}
      <div className="relative mt-4 w-full max-w-sm">
        {/* Machine frame with perspective */}
        <div className="relative rounded-3xl border border-[#2a2a40]/50 bg-linear-to-b from-[#1a1a28] to-[#12121d] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]">
          {/* Inner glow */}
          <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-white/5 via-transparent to-transparent" />
          
          {/* Reels Container */}
          <div className="relative mx-auto flex justify-center gap-3 rounded-2xl bg-[#0d0d15] p-4 shadow-[inset_0_4px_20px_rgba(0,0,0,0.5)]">
            {/* Glow effect behind reels */}
            <div className="absolute inset-0 rounded-2xl bg-linear-to-b from-[#ff6b4a]/5 via-transparent to-[#7c3aed]/5" />
            
            {[0, 1, 2].map((reelIndex) => (
              <SlotReel
                key={reelIndex}
                symbols={reelPositions[reelIndex]}
                isSpinning={isSpinning}
                delay={reelIndex * 0.3}
                getSymbol={getSymbol}
                isWin={gameResult?.isWin && reelIndex === 0}
              />
            ))}
            
            {/* Center line indicator */}
            <div className="pointer-events-none absolute left-0 right-0 top-1/2 -translate-y-1/2">
              <div className="h-0.5 w-full bg-linear-to-r from-transparent via-[#ff6b4a]/50 to-transparent" />
            </div>
          </div>

          {/* Side decorations - joysticks */}
          <div className="absolute -left-3 top-1/2 h-16 w-6 -translate-y-1/2 rounded-lg bg-linear-to-b from-[#4a4a60] to-[#2a2a40] shadow-lg" />
          <div className="absolute -right-3 top-1/2 h-16 w-6 -translate-y-1/2 rounded-lg bg-linear-to-b from-[#4a4a60] to-[#2a2a40] shadow-lg" />
        </div>

        {/* Stats bar */}
        <div className="mt-4 flex items-center justify-center gap-4">
          <div className="flex items-center gap-2 rounded-full bg-[#1a1a28]/80 px-4 py-2">
            <span className="text-lg">🎰</span>
            <span className="text-sm font-medium text-[#ff6b4a]">985</span>
          </div>
          <div className="h-4 w-px bg-[#2a2a40]" />
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-3 w-8 rounded-sm bg-linear-to-r from-[#ff6b4a] to-[#ff8b6a]" />
            ))}
          </div>
        </div>
      </div>
      {/* Nome do hábito central em destaque */}
      {!isSpinning && !showResult && habits.length >= 10 && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="mt-2 text-center"
        >
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#6b6b7e]">Hábito em Foco</p>
          <p className="text-sm font-medium text-purple-400">
            {habits[reelPositions[1][1]]?.name || "---"}
          </p>
        </motion.div>
      )}
      {/* Result Display */}
      <AnimatePresence>
        {showResult && gameResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mt-6 rounded-xl border border-[#2a2a40]/50 bg-[#12121d]/90 px-8 py-4 backdrop-blur-xl"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">👾</span>
              <span 
                className={`font-mono text-lg font-bold tracking-wider ${
                  gameResult.isWin ? "text-[#4ade80]" : "text-[#ff6b9d]"
                }`}
                style={{
                  textShadow: gameResult.isWin 
                    ? "0 0 20px rgba(74,222,128,0.5)" 
                    : "0 0 20px rgba(255,107,157,0.5)"
                }}
              >
                {gameResult.message}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Controls */}
      <div className="mt-auto pb-8 pt-6">
        {/* Shuffle Button */}
        <motion.button
          onClick={onSpin}
          disabled={!canPlay || isSpinning}
          whileHover={{ scale: canPlay ? 1.02 : 1 }}
          whileTap={{ scale: canPlay ? 0.98 : 1 }}
          className={`
            group relative overflow-hidden rounded-2xl px-16 py-4
            ${canPlay 
              ? "bg-linear-to-b from-[#2a2a40] to-[#1a1a28] shadow-[0_4px_20px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]" 
              : "bg-[#1a1a28]/50 opacity-60"
            }
            border border-[#3a3a50]/50
            transition-all duration-300
          `}
        >
          <span className={`
            relative z-10 font-semibold tracking-wider
            ${canPlay ? "text-white" : "text-[#6b6b7e]"}
          `}>
            {isSpinning ? "SPINNING..." : "SHUFFLE"}
          </span>
          
          {/* Animated shine effect */}
          {canPlay && !isSpinning && (
            <motion.div
              className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent"
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            />
          )}
        </motion.button>

        {/* Help button */}
        <div className="mt-4 flex justify-center">
          <button className="flex size-10 items-center justify-center rounded-full border border-[#2a2a40] bg-[#1a1a28]">
            <HelpCircle className="size-5 text-[#6b6b7e]" />
          </button>
        </div>

        {!canPlay && (
          <p className="mt-4 text-center text-sm text-[#ff6b9d]">
            Precisa de pelo menos 10 habitos para jogar ({habits.length}/10)
          </p>
        )}
      </div>
    </motion.div>
  )
}

function SlotReel({
  symbols,
  isSpinning,
  delay,
  getSymbol,
  isWin,
}: {
  symbols: number[]
  isSpinning: boolean
  delay: number
  getSymbol: (index: number) => string
  isWin?: boolean
}) {
  const controls = useAnimation()

  useEffect(() => {
    if (isSpinning) {
      // Inicia a rotação infinita/rápida
      controls.start({
        y: [0, -1200], // Valor maior para parecer mais rápido
        transition: {
          duration: 0.4,
          repeat: Infinity, // Gira até que isSpinning mude para false
          ease: "linear",
          delay,
        },
      })
    } else {
      // Quando parar, faz o "snap" para a posição final
      controls.stop()
      controls.start({
        y: 0,
        transition: {
          type: "spring",
          stiffness: 200,
          damping: 20,
        },
      })
    }
  }, [isSpinning, controls, delay])

  return (
    <div className="relative h-48 w-20 overflow-hidden rounded-xl border border-[#2a2a40]/30 bg-linear-to-b from-[#1a1a28] to-[#12121d] shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
      {/* Top gradient fade */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-12 bg-linear-to-b from-[#0d0d15] to-transparent" />
      
      {/* Bottom gradient fade */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-12 bg-linear-to-t from-[#0d0d15] to-transparent" />
      
      {/* Symbols */}
      <motion.div
        animate={controls}
        className="flex flex-col items-center gap-2 py-2"
      >
        {symbols.map((symbolIndex, i) => (
          <motion.div
            key={i}
            className={`
              flex h-14 w-14 items-center justify-center rounded-xl
              ${i === 1 && !isSpinning
                ? "bg-linear-to-br from-[#ff6b4a]/20 to-[#7c3aed]/20 shadow-[0_0_20px_rgba(255,107,74,0.3)]"
                : "bg-[#1a1a28]/50"
              }
            `}
            animate={i === 1 && isWin && !isSpinning ? {
              scale: [1, 1.1, 1],
              boxShadow: [
                "0 0 0px rgba(74,222,128,0)",
                "0 0 30px rgba(74,222,128,0.5)",
                "0 0 0px rgba(74,222,128,0)",
              ],
            } : {}}
            transition={{ duration: 0.5, repeat: isWin ? 3 : 0 }}
          >
            <span className="text-3xl">{getSymbol(symbolIndex)}</span>
          </motion.div>
        ))}
      </motion.div>
      
      {/* Glow edge effect */}
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-linear-to-br from-[#ff6b4a]/5 via-transparent to-[#7c3aed]/5" />
    </div>
  )
}

function LeaderboardScreen({
  players,
  userScore,
}: {
  players: Player[]
  userScore: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="flex flex-1 flex-col items-center px-4"
    >
      {/* Top Players Avatars */}
      <div className="mt-6 flex items-end justify-center gap-4">
        {/* Second place */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <div className="size-14 rounded-full bg-linear-to-br from-[#4a4a60] to-[#2a2a40] p-1">
            <div className="flex size-full items-center justify-center rounded-full bg-[#1a1a28] text-2xl">
              😎
            </div>
          </div>
        </motion.div>
        
        {/* First place */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="relative"
        >
          <div className="size-20 rounded-full bg-linear-to-br from-[#fbbf24] via-[#f59e0b] to-[#d97706] p-1 shadow-[0_0_30px_rgba(251,191,36,0.4)]">
            <div className="flex size-full items-center justify-center rounded-full bg-[#1a1a28] text-3xl">
              🕶️
            </div>
          </div>
          <div className="absolute -top-2 left-1/2 -translate-x-1/2">
            <Sparkles className="size-5 text-[#fbbf24]" />
          </div>
        </motion.div>
        
        {/* Third place */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <div className="size-14 rounded-full bg-linear-to-br from-[#4a4a60] to-[#2a2a40] p-1">
            <div className="flex size-full items-center justify-center rounded-full bg-[#1a1a28] text-2xl">
              🤠
            </div>
          </div>
        </motion.div>
      </div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-6 text-center"
      >
        <h2 className="text-lg font-bold tracking-wider text-white">THE BEST</h2>
        <h2 className="text-lg font-bold tracking-wider text-white">PLAYERS</h2>
        <p className="mt-2 text-xs text-[#6b6b7e]">
          BY BUYING POINTS,
          <br />
          YOU CAN BE IN THE TOP LIST
        </p>
      </motion.div>

      {/* Leaderboard List */}
      <div className="mt-6 w-full max-w-sm flex-1 overflow-hidden rounded-2xl border border-[#2a2a40]/30 bg-linear-to-b from-[#1a1a28] to-[#12121d]">
        <div className="scrollbar-hide max-h-64 overflow-y-auto p-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {players.map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="mb-3 flex items-center justify-between rounded-xl bg-[#12121d]/50 p-3"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 text-center text-sm font-medium text-[#6b6b7e]">
                  {index + 1}
                </span>
                <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-[#3a3a50] to-[#2a2a40] text-lg">
                  {["🕶️", "😎", "🤠", "👤"][index] || "👤"}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{player.name}</p>
                  <p className="text-xs text-[#6b6b7e]">Lvl {Math.floor(player.score / 10)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#4ade80]">
                  +{player.increment}
                </span>
                <Trophy className="size-4 text-[#fbbf24]" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Buy Points Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="mb-8 mt-6 w-full max-w-sm rounded-2xl bg-linear-to-b from-[#2a2a40] to-[#1a1a28] px-8 py-4 font-semibold tracking-wider text-white shadow-[0_4px_20px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all duration-300"
      >
        BUY POINTS
      </motion.button>

      {/* Navigation dots */}
      <div className="mb-4 flex gap-2">
        <div className="h-1 w-6 rounded-full bg-[#3a3a50]" />
        <div className="h-1 w-6 rounded-full bg-white" />
      </div>
    </motion.div>
  )
}
