"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Brain, Flame, BarChart3 } from "lucide-react"
import { useSoundContext } from "@/components/trial-wizzard/sound-provider"

const screenshots = [
  {
    title: "Wizzard IA",
    description: "Planeje seu dia com ajuda da inteligencia artificial",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Captura%20de%20tela%202026-04-14%20034326-FjL0G4MmbZdlkAXOFk4GsbwXwQuu0r.png",
    icon: Brain,
  },
  {
    title: "Sequencia",
    description: "Mantenha seu streak e evolua constantemente",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Captura%20de%20tela%202026-04-14%20034329-kvueerBM2OmlZGwXXgL617sn8h1UjZ.png",
    icon: Flame,
  },
  {
    title: "Estatisticas",
    description: "Acompanhe seu progresso com graficos detalhados",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-dgoLPH5W6EJdKZeHUk4SpQMTHZvOuU.png",
    icon: BarChart3,
  },
  {
    title: "Mentor IA",
    description: "Crie seu assistente inteligente personalizado",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Captura%20de%20tela%202026-04-14%20034403-q2t6cF1LNDB5OyM72Xh2IyHUhKetUS.png",
    icon: Sparkles,
  },
]

export function AppPreviewSection() {
  const { playSound } = useSoundContext()

  return (
    <section className="py-20 relative overflow-hidden" id="preview">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-linear-to-b from-background via-primary/5 to-background" />
      <div className="absolute inset-0 pixel-grid opacity-30" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 border-2 border-accent/30 px-4 py-2 rounded-sm mb-6 bg-card/50">
            <div className="w-2 h-2 bg-accent animate-pulse" />
            <span className="text-xs font-mono text-accent tracking-wider">PREVIA DO APP</span>
            <div className="w-2 h-2 bg-accent animate-pulse" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Veja o <span className="text-accent">LABHABIT</span> em acao
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Interface intuitiva, escura e otimizada para produtividade. Evolua 1% a cada dia.
          </p>
        </div>

        {/* Main dashboard preview */}
        <div className="relative max-w-5xl mx-auto mb-16">
          {/* Glow effect behind */}
          <div className="absolute inset-0 bg-primary/10 blur-3xl -z-10 scale-90" />

          {/* Main screenshot container */}
          <div className="relative rounded-sm border-2 border-primary/30 overflow-hidden glow-primary">
            {/* Browser-like header */}
            <div className="bg-card border-b-2 border-primary/30 px-4 py-3 flex items-center gap-3">
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-destructive/60" />
                <div className="w-3 h-3 bg-yellow-500/60" />
                <div className="w-3 h-3 bg-primary/60" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="bg-secondary/50 border border-primary/30 px-6 py-1 text-xs text-primary font-mono">
                  app.labhabit.io
                </div>
              </div>
            </div>

            {/* Screenshot */}
            <div className="relative">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/20f502c0-cd24-4032-a425-811062aadb47-KY4XNLeYdZqfrtqfX2PtdPUL9TlEGW.png"
                alt="LABHABIT Dashboard Preview"
                width={1200}
                height={700}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Feature screenshots grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {screenshots.map((item, index) => (
            <div
              key={index}
              className="group relative bg-card border-2 border-primary/30 rounded-sm overflow-hidden hover:border-primary hover:glow-primary transition-all cursor-pointer"
              onMouseEnter={() => playSound("hover")}
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover object-top group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-linear-to-t from-card to-transparent" />
              </div>
              
              {/* Content */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-primary/20 border border-primary/50 flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground font-mono">{item.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              
              {/* Pixel corners */}
              <div className="absolute top-0 left-0 w-3 h-3 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-0 right-0 w-3 h-3 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 left-0 w-3 h-3 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button
            size="lg"
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold font-mono glow-primary px-8"
            onClick={() => playSound("click")}
          >
            <Sparkles className="w-5 h-5 mr-2" />
            QUERO EXPERIMENTAR AGORA
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  )
}
