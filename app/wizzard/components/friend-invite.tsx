"use client"

import { useState } from "react"
import { X, Check, Download, ChevronLeft } from "lucide-react"

interface FriendInviteProps {
  onBack: () => void
}

// Floating particles component
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large glow spots */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-purple-600/15 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl" />
      
      {/* Small star particles */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white/60 rounded-full animate-pulse"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  )
}

// Envelope SVG Component
function EnvelopeClosed({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 100" fill="none">
      <defs>
        <linearGradient id="envelopeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c4b5fd" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      {/* Envelope body */}
      <rect x="10" y="30" width="100" height="65" rx="4" fill="url(#envelopeGradient)" filter="url(#glow)" />
      {/* Envelope flap */}
      <path d="M10 34 L60 65 L110 34" fill="#a78bfa" />
      {/* Envelope flap top */}
      <path d="M10 30 L60 60 L110 30" stroke="#ddd6fe" strokeWidth="2" fill="#c4b5fd" />
    </svg>
  )
}

function EnvelopeOpen({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none">
      <defs>
        <linearGradient id="envelopeGradientOpen" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c4b5fd" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="paperGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#faf5ff" />
          <stop offset="100%" stopColor="#ede9fe" />
        </linearGradient>
        <filter id="glowOpen">
          <feGaussianBlur stdDeviation="10" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      {/* Paper coming out */}
      <rect x="25" y="15" width="70" height="55" rx="3" fill="url(#paperGradient)" filter="url(#glowOpen)" />
      {/* Envelope body */}
      <rect x="10" y="50" width="100" height="65" rx="4" fill="url(#envelopeGradientOpen)" filter="url(#glowOpen)" />
      {/* Envelope flap (open) */}
      <path d="M10 50 L60 20 L110 50" fill="#a78bfa" opacity="0.8" />
    </svg>
  )
}

// Avatar Component
function Avatar({ name, imageUrl, size = "md" }: { name: string; imageUrl?: string; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20",
  }
  
  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-purple-400/30 bg-gradient-to-br from-orange-300 to-orange-500`}>
      {imageUrl ? (
        <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          {/* Default avatar illustration */}
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Hair */}
            <ellipse cx="50" cy="35" rx="30" ry="25" fill="#8B4513" />
            {/* Face */}
            <ellipse cx="50" cy="50" rx="22" ry="25" fill="#FDBF6F" />
            {/* Eyes */}
            <circle cx="42" cy="48" r="3" fill="#333" />
            <circle cx="58" cy="48" r="3" fill="#333" />
            {/* Cheeks */}
            <circle cx="38" cy="55" r="4" fill="#FFB6C1" opacity="0.5" />
            <circle cx="62" cy="55" r="4" fill="#FFB6C1" opacity="0.5" />
            {/* Mouth */}
            <path d="M45 60 Q50 65 55 60" stroke="#333" strokeWidth="1.5" fill="none" />
            {/* Hair details */}
            <path d="M25 40 Q30 20 50 15 Q70 20 75 40" fill="#8B4513" />
          </svg>
        </div>
      )}
    </div>
  )
}

export default function FriendInvite({ onBack }: FriendInviteProps) {
  const [currentStep, setCurrentStep] = useState<"received" | "sent" | "download">("received")

  const features = [
    "AI música para foco, sono e relaxamento",
    "Bloqueio de apps durante sessões",
    "Cenários e progresso pessoal",
    "Sincronização com smartwatches",
    "Ranking e foco junto com amigos",
  ]

  // Screen 1: Invitation Received
  const ReceivedScreen = () => (
    <div className="relative flex flex-col items-center justify-between h-full py-8 px-6">
      <FloatingParticles />
      
      {/* Header text */}
      <div className="text-center z-10 mt-8">
        <p className="text-white/90 text-lg font-medium">
          Seu amigo enviou um convite
        </p>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center z-10 -mt-4">
        <Avatar name="Eva" size="lg" />
        <span className="text-white/80 text-sm mt-2">Eva</span>
      </div>

      {/* Envelope */}
      <div className="relative z-10 -mt-8">
        <div className="absolute inset-0 bg-purple-500/30 rounded-full blur-3xl scale-150" />
        <EnvelopeClosed className="w-48 h-40 relative" />
      </div>

      {/* Button */}
      <button
        onClick={() => setCurrentStep("sent")}
        className="w-full bg-white/10 hover:bg-white/15 backdrop-blur-sm text-white font-medium py-4 px-6 rounded-full transition-all border border-white/20 z-10"
      >
        Abrir carta
      </button>
    </div>
  )

  // Screen 2: Invitation Sent
  const SentScreen = () => (
    <div className="relative flex flex-col items-center h-full py-8 px-6">
      <FloatingParticles />
      
      {/* Close button */}
      <button
        onClick={onBack}
        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center z-20"
      >
        <X className="w-4 h-4 text-white/70" />
      </button>

      {/* Header text */}
      <div className="text-center z-10 mt-12">
        <p className="text-white/90 text-lg font-medium">
          Convite enviado
        </p>
      </div>

      {/* Avatars with connection */}
      <div className="flex items-center justify-center gap-4 z-10 mt-16 mb-auto">
        <div className="flex flex-col items-center">
          <div className="relative">
            <Avatar name="Eva" size="lg" />
            {/* Notification dots */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#0c0c0c]" />
            <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-[#0c0c0c]" />
          </div>
          <span className="text-white/80 text-sm mt-2">Eva</span>
        </div>

        {/* Connection arrow */}
        <div className="flex items-center gap-1 mx-2">
          <div className="w-8 h-[2px] bg-gradient-to-r from-purple-400/50 to-purple-400" />
          <svg className="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>

        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center bg-white/5">
              <svg className="w-8 h-8 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>
          <span className="text-white/80 text-sm mt-2">Masha</span>
        </div>
      </div>

      {/* Continue button */}
      <button
        onClick={() => setCurrentStep("download")}
        className="w-full bg-white/10 hover:bg-white/15 backdrop-blur-sm text-white font-medium py-4 px-6 rounded-full transition-all border border-white/20 z-10 mt-auto"
      >
        Continuar
      </button>
    </div>
  )

  // Screen 3: Download App
  const DownloadScreen = () => (
    <div className="relative flex flex-col h-full py-8 px-6">
      <FloatingParticles />
      
      {/* Header */}
      <div className="text-center z-10 mt-4">
        <h2 className="text-white text-xl font-semibold mb-1">
          Junte-se ao seu amigo
        </h2>
        <p className="text-white/60 text-sm">
          Foque melhor juntos
        </p>
      </div>

      {/* Features list */}
      <div className="mt-6 space-y-3 z-10">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <Check className="w-3 h-3 text-purple-400" />
            </div>
            <span className="text-white/80 text-sm">{feature}</span>
          </div>
        ))}
      </div>

      {/* Open Envelope */}
      <div className="flex-1 flex items-center justify-center z-10 my-4">
        <div className="relative">
          <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-3xl scale-150" />
          <EnvelopeOpen className="w-44 h-44 relative" />
        </div>
      </div>

      {/* Download button */}
      <button
        onClick={onBack}
        className="w-full bg-white/10 hover:bg-white/15 backdrop-blur-sm text-white font-medium py-4 px-6 rounded-full transition-all border border-white/20 z-10 flex items-center justify-center gap-2"
      >
        <Download className="w-5 h-5" />
        Baixar aplicativo
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      {/* Phone Frame */}
      <div className="relative w-full max-w-[380px]">
        {/* Device bezel effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] rounded-[44px] -z-10 translate-x-1 translate-y-1" />
        
        {/* Main Card */}
        <div 
          className="rounded-[40px] border border-[#1c1c1c] overflow-hidden shadow-2xl h-[680px]"
          style={{
            background: "linear-gradient(180deg, #1a1025 0%, #0c0c0c 50%, #0c0c0c 100%)",
          }}
        >
          {/* Back button (only on first screen) */}
          {currentStep === "received" && (
            <button
              onClick={onBack}
              className="absolute top-6 left-6 w-10 h-10 rounded-full bg-transparent flex items-center justify-center z-20 hover:bg-white/5 transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-white/70" />
            </button>
          )}

          {currentStep === "received" && <ReceivedScreen />}
          {currentStep === "sent" && <SentScreen />}
          {currentStep === "download" && <DownloadScreen />}
        </div>
      </div>
    </div>
  )
}
