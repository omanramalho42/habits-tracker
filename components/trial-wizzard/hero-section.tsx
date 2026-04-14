"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Sparkles, Zap } from "lucide-react"
import { useSoundContext } from "./sound-provider"
import { WizardDialog } from "@/components/trial-wizzard"

import "@/app/globals.css"

export function HeroSection() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [wizardOpen, setWizardOpen] = useState(false)
  const { playSound } = useSoundContext()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setIsSubmitted(true)
      setEmail("")
      playSound("success")
      // Abre o wizard apos cadastro
      setTimeout(() => setWizardOpen(true), 500)
    }
  }
  const [particles, setParticles] = useState<any[]>([])

  useEffect(() => {
    const generated = Array.from({ length: 30 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 3}s`,
      duration: `${3 + Math.random() * 2}s`,
    }))
    setParticles(generated)
  }, [])
  const handleOpenWizard = () => {
    playSound("click")
    setWizardOpen(true)
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated pixel grid background */}
      <div className="absolute inset-0 pixel-grid" />
      
      {/* Floating pixel particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/40 animate-float"
            style={{
              left: p.left,
              top: p.top,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}
      </div>
      
      {/* Corner decorations - pixel style */}
      <div className="absolute top-0 left-0 w-40 h-40">
        <div className="absolute top-4 left-4 w-20 h-2 bg-primary/30" />
        <div className="absolute top-4 left-4 w-2 h-20 bg-primary/30" />
        <div className="absolute top-8 left-8 w-3 h-3 bg-primary" />
      </div>
      <div className="absolute top-0 right-0 w-40 h-40">
        <div className="absolute top-4 right-4 w-20 h-2 bg-primary/30" />
        <div className="absolute top-4 right-4 w-2 h-20 bg-primary/30" />
        <div className="absolute top-8 right-8 w-3 h-3 bg-primary" />
      </div>
      <div className="absolute bottom-0 left-0 w-40 h-40">
        <div className="absolute bottom-4 left-4 w-20 h-2 bg-primary/30" />
        <div className="absolute bottom-4 left-4 w-2 h-20 bg-primary/30" />
        <div className="absolute bottom-8 left-8 w-3 h-3 bg-primary" />
      </div>
      <div className="absolute bottom-0 right-0 w-40 h-40">
        <div className="absolute bottom-4 right-4 w-20 h-2 bg-primary/30" />
        <div className="absolute bottom-4 right-4 w-2 h-20 bg-primary/30" />
        <div className="absolute bottom-8 right-8 w-3 h-3 bg-primary" />
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <div className="text-left">
            {/* Logo and brand */}
            <div className="flex items-center gap-4 mb-8">
              <div className="relative">
                <Image
                  src="/logo.png"
                  alt="LABHABIT Logo"
                  width={80}
                  height={80}
                  className="drop-shadow-2xl"
                />
                <div className="absolute inset-0 bg-primary/30 blur-2xl -z-10" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  LAB<span className="text-primary glow-text">HABIT</span>
                </h1>
                <p className="text-xs font-mono text-primary/80 tracking-wider">
                  SISTEMA DE EVOLUCAO PESSOAL
                </p>
              </div>
            </div>

            {/* Main headline */}
            <h2 className="text-3xl md:text-5xl font-bold text-foreground leading-tight mb-6">
              <span className="block">Rastreie Seus</span>
              <span className="text-primary glow-text">Habitos</span>
              <span className="block">e Aumente Sua</span>
              <span className="text-accent">Produtividade!</span>
            </h2>
            
            <p className="text-muted-foreground text-lg mb-8 max-w-lg">
              Controle suas rotinas, tarefas e objetivos de forma inteligente e receba notificacoes personalizadas com IA.
            </p>

            {/* Early access form */}
            <div className="max-w-md mb-8">
              {isSubmitted ? (
                <div className="space-y-4">
                  <div className="bg-primary/10 border-2 border-primary/50 rounded-sm p-4 glow-primary relative">
                    <div className="absolute top-0 left-0 w-2 h-2 bg-primary" />
                    <div className="absolute top-0 right-0 w-2 h-2 bg-primary" />
                    <div className="absolute bottom-0 left-0 w-2 h-2 bg-primary" />
                    <div className="absolute bottom-0 right-0 w-2 h-2 bg-primary" />
                    <Sparkles className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="text-primary font-mono font-bold text-center">[SUCESSO]</p>
                    <p className="text-sm text-muted-foreground text-center">Voce esta na lista VIP!</p>
                  </div>
                  <Button 
                    onClick={handleOpenWizard}
                    size="lg"
                    className="w-full bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold h-14 text-lg transition-all hover:scale-[1.02] font-mono"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    EXPERIMENTAR AGORA
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <Input
                      type="email"
                      placeholder="Digite seu melhor email..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => playSound("hover")}
                      className="w-full bg-card border-2 border-primary/30 focus:border-primary h-14 text-foreground placeholder:text-muted-foreground font-mono pr-4"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    size="lg"
                    onClick={() => playSound("click")}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-14 text-lg glow-primary transition-all hover:scale-[1.02] font-mono border-2 border-primary"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    ACESSO ANTECIPADO GRATUITO
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <p className="text-xs text-center text-primary/80 font-mono">
                    [ VAGAS LIMITADAS PARA O ACESSO ANTECIPADO ]
                  </p>
                </form>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary font-mono">2.847+</p>
                <p className="text-xs text-muted-foreground">Usuarios</p>
              </div>
              <div className="w-px bg-border/30" />
              <div className="text-center">
                <p className="text-2xl font-bold text-accent font-mono">100%</p>
                <p className="text-xs text-muted-foreground">Gratuito</p>
              </div>
              <div className="w-px bg-border/30" />
              <div className="text-center">
                <p className="text-2xl font-bold text-primary font-mono">IA</p>
                <p className="text-xs text-muted-foreground">Integrada</p>
              </div>
            </div>
          </div>

          {/* Right side - App mockup */}
          <div className="relative">
            <div className="relative">
              {/* Glow behind */}
              <div className="absolute inset-0 bg-primary/20 blur-3xl -z-10 scale-90" />
              
              {/* Desktop mockup */}
              <div className="relative border-2 border-primary/30 rounded-sm overflow-hidden glow-primary bg-card">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/20f502c0-cd24-4032-a425-811062aadb47-KY4XNLeYdZqfrtqfX2PtdPUL9TlEGW.png"
                  alt="LABHABIT App Dashboard"
                  width={800}
                  height={500}
                  className="w-full"
                />
              </div>
              
              {/* Floating mobile mockup */}
              <div className="absolute -bottom-8 -left-8 w-40 border-2 border-primary/40 rounded-sm overflow-hidden glow-primary bg-card transform rotate-[-5deg] hidden md:block">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Captura%20de%20tela%202026-04-14%20034326-FjL0G4MmbZdlkAXOFk4GsbwXwQuu0r.png"
                  alt="LABHABIT Mobile"
                  width={200}
                  height={400}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background to-transparent" />
      
      {/* Trial Wizard Dialog */}
      <WizardDialog open={wizardOpen} onOpenChange={setWizardOpen} />
    </section>
  )
}
