"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Search,
  Calendar,
  SlidersHorizontal,
  Home,
  List,
  Mic,
  Settings,
  MessageCircle,
  MoreHorizontal,
  Download,
  Battery,
  Wifi,
  Signal,
  X,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Conversation {
  id: string
  title: string
  description: string
  duration: string
  timestamp: string
  date: string
  tags: string[]
  transcription?: string
}

// Animated Waveform Component
function Waveform({ isActive, variant = "compact" }: { isActive: boolean; variant?: "compact" | "full" }) {
  const barCount = variant === "full" ? 64 : 32
  
  return (
    <div className={cn(
      "flex items-center justify-center gap-[2px]",
      variant === "full" ? "h-32" : "h-12"
    )}>
      {Array.from({ length: barCount }).map((_, i) => {
        const delay = i * 0.02
        const baseHeight = variant === "full" 
          ? Math.sin(i * 0.3) * 30 + 40
          : Math.sin(i * 0.4) * 8 + 12
        
        return (
          <motion.div
            key={i}
            className={cn(
              "rounded-full",
              variant === "full" 
                ? "w-1 bg-gradient-to-t from-blue-500 via-purple-500 to-pink-500"
                : "w-0.5 bg-gradient-to-t from-purple-600 to-purple-400"
            )}
            animate={isActive ? {
              height: [baseHeight, baseHeight * 1.8, baseHeight * 0.5, baseHeight],
              opacity: [0.6, 1, 0.8, 0.6],
            } : {
              height: variant === "full" ? 4 : 2,
              opacity: 0.3,
            }}
            transition={{
              duration: 0.8,
              delay,
              repeat: isActive ? Infinity : 0,
              ease: "easeInOut",
            }}
          />
        )
      })}
    </div>
  )
}

// Full Screen Waveform with Gradient
function FullWaveform({ isActive }: { isActive: boolean }) {
  return (
    <div className="relative flex h-48 w-full items-center justify-center overflow-hidden">
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-radial from-blue-500/20 via-purple-500/10 to-transparent"
        animate={isActive ? {
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.1, 1],
        } : { opacity: 0.1 }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      {/* Waveform bars */}
      <div className="relative z-10 flex items-center justify-center gap-[3px]">
        {Array.from({ length: 48 }).map((_, i) => {
          const centerDistance = Math.abs(i - 24)
          const baseHeight = Math.max(20, 80 - centerDistance * 3)
          
          // Create gradient color based on position
          const hue = 200 + (i / 48) * 120 // Blue to pink
          
          return (
            <motion.div
              key={i}
              className="w-1.5 rounded-full"
              style={{
                background: `linear-gradient(to top, 
                  hsl(${hue}, 80%, 50%), 
                  hsl(${hue + 30}, 90%, 60%), 
                  hsl(${hue + 60}, 85%, 70%)
                )`,
              }}
              animate={isActive ? {
                height: [baseHeight, baseHeight * 1.5, baseHeight * 0.6, baseHeight],
                opacity: [0.7, 1, 0.8, 0.7],
              } : {
                height: 4,
                opacity: 0.3,
              }}
              transition={{
                duration: 0.6 + Math.random() * 0.4,
                delay: i * 0.015,
                repeat: isActive ? Infinity : 0,
                ease: "easeInOut",
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

// Status Bar Component
function StatusBar({ battery = 94 }: { battery?: number }) {
  const time = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  })
  
  return (
    <div className="flex items-center justify-between px-6 py-2 text-sm text-white">
      <div className="flex items-center gap-1">
        <span className="font-medium">{time}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Signal className="size-4" />
        <Wifi className="size-4" />
        <div className="flex items-center gap-0.5">
          <Battery className="size-4" />
          <span className="text-xs">{battery}%</span>
        </div>
      </div>
    </div>
  )
}

// Conversation Card Component
function ConversationCard({ conversation, onClick }: { conversation: Conversation; onClick?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      className="cursor-pointer rounded-2xl border border-white/5 bg-white/[0.03] p-4 backdrop-blur-sm transition-colors hover:bg-white/[0.06]"
    >
      <div className="mb-2 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-purple-500/20">
            <Mic className="size-4 text-purple-400" />
          </div>
          {conversation.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white/70"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs text-white/50">
          <span>{conversation.timestamp}</span>
          <span className="rounded-md bg-white/10 px-1.5 py-0.5">{conversation.duration}</span>
        </div>
      </div>
      <h3 className="mb-1 font-medium text-white">{conversation.title}</h3>
      <p className="line-clamp-2 text-sm text-white/50">{conversation.description}</p>
    </motion.div>
  )
}

// Main Voice Assistant Component
export function VoiceAssistant() {
  const [mode, setMode] = useState<"list" | "listening">("list")
  const [isListening, setIsListening] = useState(false)
  const [transcription, setTranscription] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const queryClient = useQueryClient()
  
  // Transcription phrases for demo
  const transcriptionPhrases = [
    "Yes, we want to",
    "Yes, we want to prioritise this month,",
    "Yes, we want to prioritise this month, I hope we can agree on...",
  ]
  
  // Fetch conversations
  const { data: conversations = [], isLoading } = useQuery<Conversation[]>({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await fetch("/api/conversations")
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
  })
  
  // Create conversation mutation
  const createConversation = useMutation({
    mutationFn: async (data: Partial<Conversation>) => {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] })
    },
  })
  
  // Simulate transcription when listening
  useEffect(() => {
    if (!isListening) {
      setTranscription("")
      return
    }
    
    let phraseIndex = 0
    const interval = setInterval(() => {
      if (phraseIndex < transcriptionPhrases.length) {
        setTranscription(transcriptionPhrases[phraseIndex])
        phraseIndex++
      }
    }, 1500)
    
    return () => clearInterval(interval)
  }, [isListening])
  
  // Group conversations by date
  const groupedConversations = conversations.reduce((acc, conv) => {
    if (!acc[conv.date]) acc[conv.date] = []
    acc[conv.date].push(conv)
    return acc
  }, {} as Record<string, Conversation[]>)
  
  // Filter conversations
  const filteredConversations = searchQuery
    ? conversations.filter(
        (c) =>
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations
  
  const handleStartListening = () => {
    setMode("listening")
    setIsListening(true)
    // TODO: Integrate OpenAI Whisper API here for real speech-to-text
    // const recognition = new webkitSpeechRecognition()
    // recognition.continuous = true
    // recognition.onresult = (event) => { ... }
  }
  
  const handleStopListening = () => {
    setIsListening(false)
    if (transcription) {
      createConversation.mutate({
        title: "New Voice Session",
        description: transcription,
        tags: ["Voice"],
        duration: "0m 30s",
        transcription,
      })
    }
    setTimeout(() => setMode("list"), 500)
  }
  
  return (
    <div className="relative mx-auto flex min-h-screen max-w-md flex-col bg-[#0a0a0c]">
      {/* Background gradients */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-1/4 top-1/4 size-96 rounded-full bg-purple-900/20 blur-[100px]" />
        <div className="absolute -right-1/4 top-1/2 size-96 rounded-full bg-blue-900/20 blur-[100px]" />
      </div>
      
      {/* Status Bar */}
      <StatusBar />
      
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-full bg-green-500" />
            <span className="text-sm text-white/70">96%</span>
          </div>
          <Button variant="ghost" size="icon" className="size-8 text-white/50">
            <Download className="size-4" />
          </Button>
        </div>
        
        <div className="flex flex-col items-center">
          <span className="text-sm font-medium text-white">JackPot</span>
          <span className="text-xs text-white/40">MiniGame</span>
        </div>
        
        <Button variant="ghost" size="icon" className="size-8 text-white/50">
          <MoreHorizontal className="size-4" />
        </Button>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {mode === "listening" ? (
            <motion.div
              key="listening"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full flex-col"
            >
              {/* Listening indicator */}
              <div className="flex items-center justify-end gap-2 px-4 py-2">
                <motion.div
                  className="flex items-center gap-2"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <div className="flex items-center gap-1">
                    <motion.div
                      className="h-4 w-0.5 rounded-full bg-white/50"
                      animate={{ scaleY: [0.5, 1, 0.5] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    />
                    <motion.div
                      className="h-4 w-0.5 rounded-full bg-white/50"
                      animate={{ scaleY: [1, 0.5, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
                    />
                    <motion.div
                      className="h-4 w-0.5 rounded-full bg-white/50"
                      animate={{ scaleY: [0.5, 1, 0.5] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
                    />
                  </div>
                  <span className="text-sm text-green-400">Listening</span>
                  <motion.div
                    className="size-2 rounded-full bg-red-500"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                </motion.div>
              </div>
              
              {/* Large Waveform */}
              <div className="flex-1 px-4 py-8">
                <FullWaveform isActive={isListening} />
                
                {/* Transcription */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 text-center"
                >
                  <p className="text-lg font-light text-white/40">
                    {transcription || "Start speaking..."}
                  </p>
                </motion.div>
              </div>
              
              {/* Stop Button */}
              <div className="p-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleStopListening}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 py-4 text-red-400 backdrop-blur-sm"
                >
                  <X className="size-5" />
                  <span>Stop Listening</span>
                </motion.button>
              </div>
              
              {/* Search and Recent */}
              <div className="border-t border-white/5 p-4">
                <div className="relative mb-4">
                  <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/30" />
                  <Input
                    placeholder="Search Conversations"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-12 rounded-xl border-white/10 bg-white/5 pl-11 text-white placeholder:text-white/30"
                  />
                  <div className="absolute right-2 top-1/2 flex -translate-y-1/2 gap-1">
                    <Button variant="ghost" size="icon" className="size-8 text-white/50">
                      <Calendar className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="size-8 text-white/50">
                      <SlidersHorizontal className="size-4" />
                    </Button>
                  </div>
                </div>
                
                <p className="mb-2 text-sm text-white/40">Recent</p>
                <div className="max-h-32 space-y-2 overflow-y-auto scrollbar-hide">
                  {filteredConversations.slice(0, 2).map((conv) => (
                    <div
                      key={conv.id}
                      className="rounded-xl border border-white/5 bg-white/[0.02] p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/60">
                            {conv.tags[0]}
                          </span>
                        </div>
                        <span className="text-xs text-white/30">23 min ago</span>
                      </div>
                      <p className="mt-1 text-sm font-medium text-white">{conv.title}</p>
                      <p className="line-clamp-1 text-xs text-white/40">{conv.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full flex-col"
            >
              {/* Listening Card */}
              <div className="px-4 py-2">
                <motion.div
                  className="overflow-hidden rounded-2xl border p-4 backdrop-blur-xl transition-colors duration-300 hover:border-white/20"
                  style={{ 
                    borderColor: "rgba(255,255,255,0.1)", 
                    backgroundColor: "rgba(255,255,255,0.03)" 
                  }}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-purple-500/20">
                        <Mic className="size-4 text-purple-400" />
                      </div>
                      <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-white/60">
                        In progress...
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-green-400">Listening</span>
                      <motion.div
                        className="size-2 rounded-full bg-green-500"
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                    </div>
                  </div>
                  
                  <p className="mb-3 text-sm text-white/50">
                    ription service is running, guess. Just gonna sta...
                  </p>
                  
                  <Waveform isActive={true} variant="compact" />
                </motion.div>
              </div>
              
              {/* Search Bar */}
              <div className="px-4 py-3">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/30" />
                  <Input
                    placeholder="Search Conversations"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-12 rounded-xl border-white/10 bg-white/5 pl-11 text-white placeholder:text-white/30"
                  />
                  <div className="absolute right-2 top-1/2 flex -translate-y-1/2 gap-1">
                    <Button variant="ghost" size="icon" className="size-8 text-white/50">
                      <Calendar className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="size-8 text-white/50">
                      <SlidersHorizontal className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto px-4 pb-24 scrollbar-hide">
                {Object.entries(groupedConversations).map(([date, convs]) => (
                  <div key={date} className="mb-4">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-sm font-medium text-white/60">{date}</span>
                      <div className="h-px flex-1 bg-white/10" />
                    </div>
                    <div className="space-y-2">
                      {convs.map((conv, i) => (
                        <motion.div
                          key={conv.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                        >
                          <ConversationCard conversation={conv} />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Chat FAB */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartListening}
                className="fixed bottom-24 right-6 flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-3 font-medium text-white shadow-lg shadow-purple-500/30"
              >
                <MessageCircle className="size-5" />
                Chat
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-1/2 z-20 w-full max-w-md -translate-x-1/2 border-t border-white/5 bg-[#0a0a0c]/90 backdrop-blur-xl">
        <div className="flex items-center justify-around py-4">
          {[
            { icon: Home, label: "Home", active: true },
            { icon: List, label: "List" },
            { icon: Mic, label: "Record" },
            { icon: Search, label: "Search" },
          ].map(({ icon: Icon, label, active }) => (
            <button
              key={label}
              className={cn(
                "flex flex-col items-center gap-1 transition-colors",
                active ? "text-white" : "text-white/40 hover:text-white/60"
              )}
            >
              <Icon className="size-6" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
