import React from "react"
import { Lock } from "lucide-react"

interface PlansOverlayProps {
  children: React.ReactNode
  isPremium?: boolean
}

export const PlansOverlay = ({ children, isPremium = false }: PlansOverlayProps) => {
  if (isPremium) return <>{children}</>

  return (
    <div className="relative group w-full h-auto">
      {/* Container do Filho com Blur */}
      <div className="pointer-events-none select-none blur-[2px] opacity-95 transition-all">
        {children}
      </div>

      {/* Camada de Bloqueio */}
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 rounded-full">
        <div className="flex items-center gap-2 px-4 py-1.5 bg-[#1a1a1c] border border-yellow-500/30 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.1)] transition-transform group-hover:scale-105">
          <Lock className="h-3.5 w-3.5 text-yellow-500" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-yellow-500/90">
            ⚠️ Somente para assinantes Premium
          </span>
          <button 
            type="button"
            className="ml-2 text-[10px] text-white underline underline-offset-2 hover:text-yellow-400 transition-colors"
          >
            Assinar
          </button>
        </div>
      </div>
    </div>
  )
}