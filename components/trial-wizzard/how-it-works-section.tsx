"use client"

import Image from "next/image"
import { ListTodo, Target, LineChart, Bell, Repeat, CheckSquare, Flag, Lightbulb } from "lucide-react"
import { useSoundContext } from "./sound-provider"

const features = [
  {
    icon: Repeat,
    title: "Rotinas",
    description: "Automatize suas tarefas diarias com rotinas inteligentes que se adaptam ao seu estilo de vida.",
    color: "text-primary",
    bgColor: "bg-primary/20",
  },
  {
    icon: CheckSquare,
    title: "Tarefas",
    description: "Organize suas atividades do dia com lembretes e notificacoes personalizadas.",
    color: "text-accent",
    bgColor: "bg-accent/20",
  },
  {
    icon: Target,
    title: "Objetivos",
    description: "Defina metas de curto e longo prazo e acompanhe seu progresso em tempo real.",
    color: "text-primary",
    bgColor: "bg-primary/20",
  },
  {
    icon: Bell,
    title: "Alertas Inteligentes",
    description: "Receba notificacoes personalizadas baseadas em seus padroes de comportamento com IA.",
    color: "text-accent",
    bgColor: "bg-accent/20",
  },
]

const steps = [
  {
    icon: ListTodo,
    title: "Adicione",
    subtitle: "Habitos & Tarefas",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Captura%20de%20tela%202026-04-14%20034350-k3w92J8vjll86jFfFGYJ44R7zi4hiA.png",
  },
  {
    icon: Flag,
    title: "Crie Rotinas",
    subtitle: "e Objetivos Claros",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Captura%20de%20tela%202026-04-14%20034326-FjL0G4MmbZdlkAXOFk4GsbwXwQuu0r.png",
  },
  {
    icon: LineChart,
    title: "Monitore seu",
    subtitle: "Progresso Diario",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-dgoLPH5W6EJdKZeHUk4SpQMTHZvOuU.png",
  },
  {
    icon: Lightbulb,
    title: "Receba Alertas",
    subtitle: "Inteligentes",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Captura%20de%20tela%202026-04-14%20034329-kvueerBM2OmlZGwXXgL617sn8h1UjZ.png",
  },
]

export function HowItWorksSection() {
  const { playSound } = useSoundContext()

  return (
    <section className="py-20 relative overflow-hidden" id="como-funciona">
      {/* Background */}
      <div className="absolute inset-0 pixel-grid opacity-50" />
      
      {/* Decorative pixels */}
      <div className="absolute top-0 left-0 w-full h-2 flex">
        {Array.from({ length: 50 }).map((_, i) => (
          <div 
            key={i} 
            className={`flex-1 h-full ${i % 3 === 0 ? 'bg-primary/40' : 'bg-transparent'}`}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 border-2 border-primary/30 px-4 py-2 rounded-sm mb-6 bg-card/50">
            <div className="w-2 h-2 bg-primary animate-pulse" />
            <span className="text-xs font-mono text-primary tracking-wider">COMO FUNCIONA</span>
            <div className="w-2 h-2 bg-primary animate-pulse" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            COMO FUNCIONA o <span className="text-accent glow-text">NOSSO APP</span>?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Gerencie seus habitos, tarefas, rotinas e objetivos de forma simples e eficiente, com a ajuda de uma poderosa IA!
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-card border-2 border-primary/30 rounded-sm p-6 hover:border-primary transition-all cursor-pointer"
              onMouseEnter={() => playSound("hover")}
            >
              {/* Pixel corners */}
              <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-primary" />
              <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-primary" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-primary" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-primary" />
              
              <div className={`w-14 h-14 ${feature.bgColor} border-2 border-current rounded-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${feature.color}`}>
                <feature.icon className={`w-7 h-7 ${feature.color}`} />
              </div>
              <h3 className={`text-lg font-bold mb-2 font-mono ${feature.color}`}>{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Steps with images */}
        <div className="mb-12">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground">
              Crie habitos, rotinas e tarefas, receba notificacoes inteligentes
              <br />e monitore seu progresso com a ajuda de uma poderosa <span className="text-primary">IA</span>!
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div
                key={index}
                className="group relative"
                onMouseEnter={() => playSound("hover")}
              >
                {/* Image container */}
                <div className="relative border-2 border-primary/30 rounded-sm overflow-hidden bg-card mb-4 group-hover:border-primary group-hover:glow-primary transition-all">
                  {/* Pixel top decoration */}
                  <div className="absolute top-0 left-0 right-0 h-6 bg-primary/10 border-b-2 border-primary/30 flex items-center px-2 gap-1">
                    <div className="w-2 h-2 bg-destructive/60 rounded-full" />
                    <div className="w-2 h-2 bg-yellow-500/60 rounded-full" />
                    <div className="w-2 h-2 bg-primary/60 rounded-full" />
                  </div>
                  
                  <div className="pt-6">
                    <Image
                      src={step.image}
                      alt={step.title}
                      width={300}
                      height={200}
                      className="w-full h-40 object-cover object-top"
                    />
                  </div>
                </div>
                
                {/* Content */}
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/20 border-2 border-primary rounded-sm flex items-center justify-center mx-auto mb-3">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-bold text-foreground">{step.title}</h4>
                  <p className="text-sm text-accent">{step.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Bottom decoration */}
      <div className="absolute bottom-0 left-0 w-full h-2 flex">
        {Array.from({ length: 50 }).map((_, i) => (
          <div 
            key={i} 
            className={`flex-1 h-full ${i % 3 === 0 ? 'bg-primary/40' : 'bg-transparent'}`}
          />
        ))}
      </div>
    </section>
  )
}
