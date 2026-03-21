"use client"

import { Plus, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function FloatingActionBar() {
  return (
    <div className="fixed bottom-24 left-0 right-0 z-50 flex justify-center px-4">
      
      <div className="relative w-full max-w-md">

        {/* 🔥 GLOW SUPERIOR (linha neon conectando tudo) */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-[90%] h-10 
          bg-gradient-to-r from-transparent via-green-500/60 to-transparent 
          blur-2xl opacity-60 pointer-events-none"
        />

        {/* CONTAINER */}
        <div
          className={cn(
            "relative flex items-center justify-between",
            "px-4 py-2 rounded-full",

            // glass
            "bg-black/60 backdrop-blur-xl",

            // borda suave
            "border border-white/10",

            // glow geral
            "shadow-[0_0_30px_rgba(34,197,94,0.15)]"
          )}
        >

          {/* LEFT */}
          <Button
            variant="ghost"
            className="text-green-400 hover:bg-green-500/10 gap-2 rounded-full text-sm font-medium tracking-tight"
          >
            <Plus className="w-4 h-4" />
            Nova rotina
          </Button>

          {/* CENTER BUTTON (FLOATING) */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-6">

            {/* glow externo */}
            <div className="absolute inset-0 rounded-full bg-green-500 blur-2xl opacity-50 scale-125" />

            {/* botão */}
            <Button
              size="icon"
              className={cn(
                "relative z-10 w-16 h-16 rounded-full",
                "bg-green-500 text-white",

                // brilho
                "shadow-[0_0_30px_rgba(34,197,94,0.9)]",

                // leve borda luminosa
                "ring-2 ring-green-400/40",

                "hover:scale-105 transition"
              )}
            >
              <Plus className="w-7 h-7" />
            </Button>
          </div>

          {/* RIGHT */}
          <Button
            variant="ghost"
            className="text-green-400 hover:bg-green-500/10 gap-2 rounded-full text-sm font-medium tracking-tight"
          >
            <Check className="w-4 h-4" />
            Registrar tudo
          </Button>

        </div>
      </div>
    </div>
  )
}