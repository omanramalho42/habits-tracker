"use client"

import { Brain, Target, Bell, Calendar, BarChart3, Folder, Zap, Repeat, Sparkles, MessageSquare } from "lucide-react"
import { useSoundContext } from "./sound-provider"

const features = [
  {
    icon: Brain,
    title: "IA Adaptativa",
    description: "Algoritmos que aprendem seus padroes e sugerem melhorias personalizadas",
    color: "text-primary",
  },
  {
    icon: Target,
    title: "Objetivos Inteligentes",
    description: "Defina metas e deixe a IA criar o caminho ideal para alcanca-las",
    color: "text-accent",
  },
  {
    icon: Bell,
    title: "Alertas Personalizados",
    description: "Notificacoes no momento certo para manter voce no caminho",
    color: "text-primary",
  },
  {
    icon: Calendar,
    title: "Rotinas Flexiveis",
    description: "Crie e ajuste rotinas que se adaptam ao seu estilo de vida",
    color: "text-accent",
  },
  {
    icon: BarChart3,
    title: "Estatisticas Detalhadas",
    description: "Visualize seu progresso com graficos e analises profundas",
    color: "text-primary",
  },
  {
    icon: Folder,
    title: "Categorias Organizadas",
    description: "Organize habitos por areas: saude, trabalho, estudos e mais",
    color: "text-accent",
  },
  {
    icon: Zap,
    title: "Gamificacao",
    description: "Conquiste badges e mantenha streaks para motivacao extra",
    color: "text-primary",
  },
  {
    icon: Repeat,
    title: "Habitos Recorrentes",
    description: "Configure frequencias diarias, semanais ou personalizadas",
    color: "text-accent",
  },
  {
    icon: Sparkles,
    title: "Mentor IA",
    description: "Crie seu assistente virtual personalizado para te guiar",
    color: "text-primary",
  },
  {
    icon: MessageSquare,
    title: "Chat Inteligente",
    description: "Converse com a IA para planejar seu dia de forma eficiente",
    color: "text-accent",
  },
]

export function FeaturesSection() {
  const { playSound } = useSoundContext()

  return (
    <section className="py-20 relative" id="funcionalidades">
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-b from-background via-card/10 to-background" />
      
      {/* Section header */}
      <div className="container mx-auto px-4 mb-16 relative z-10">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 border-2 border-primary/30 px-4 py-2 rounded-sm mb-6 bg-card/50">
            <div className="w-2 h-2 bg-primary animate-pulse" />
            <span className="text-xs font-mono text-primary tracking-wider">FUNCIONALIDADES</span>
            <div className="w-2 h-2 bg-primary animate-pulse" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Tudo que voce precisa para{" "}
            <span className="text-primary glow-text">EVOLUIR</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Ferramentas poderosas combinadas com inteligencia artificial para transformar seus habitos em resultados reais.
          </p>
        </div>
      </div>

      {/* Features grid */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-card border-2 border-primary/20 rounded-sm p-5 hover:border-primary/60 transition-all duration-300 cursor-pointer"
              onMouseEnter={() => playSound("hover")}
            >
              {/* Pixel corner accents */}
              <div className="absolute top-0 left-0 w-2 h-2 bg-primary/40 group-hover:bg-primary transition-colors" />
              <div className="absolute top-0 right-0 w-2 h-2 bg-primary/40 group-hover:bg-primary transition-colors" />
              <div className="absolute bottom-0 left-0 w-2 h-2 bg-primary/40 group-hover:bg-primary transition-colors" />
              <div className="absolute bottom-0 right-0 w-2 h-2 bg-primary/40 group-hover:bg-primary transition-colors" />
              
              <div className="relative">
                <div className={`w-12 h-12 bg-secondary border-2 border-primary/30 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-primary transition-all`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-base font-bold text-foreground mb-2 font-mono">{feature.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
              
              {/* Hover glow */}
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          ))}
        </div>
      </div>

      {/* Decorative side elements */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-1 h-64 bg-linear-to-b from-transparent via-primary/30 to-transparent" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1 h-64 bg-linear-to-b from-transparent via-accent/30 to-transparent" />
    </section>
  )
}
