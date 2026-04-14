"use client"

import { useState } from "react"
import { Check, Sparkles, Zap, Crown, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSoundContext } from "./sound-provider"
import { WizardDialog } from "@/components/trial-wizzard/wizzard-dialog"

const plans = [
  {
    name: "GRATIS",
    price: "R$ 0",
    period: "/Mes",
    description: "Acesso antecipado gratuito por tempo limitado",
    icon: Zap,
    features: [
      "Monitoramento de habitos e tarefas",
      "Alertas inteligentes",
      "Suporte basico de IA",
      "Ate 10 habitos ativos",
      "Estatisticas basicas",
    ],
    cta: "COMECE AGORA",
    popular: false,
    highlighted: false,
  },
  {
    name: "PRO",
    price: "R$ 29",
    period: "/Mes",
    description: "Para quem leva evolucao a serio",
    icon: Sparkles,
    features: [
      "IA avancada e personalizada",
      "Relatorios detalhados",
      "Habitos e tarefas ilimitados",
      "Categorias personalizadas",
      "Exportacao de dados",
      "Suporte prioritario",
    ],
    cta: "QUERO ACESSO ANTECIPADO",
    popular: true,
    highlighted: true,
  },
  {
    name: "PREMIUM",
    price: "R$ 49",
    period: "/Mes",
    description: "Em breve - Lista de espera",
    icon: Crown,
    features: [
      "Tudo do Pro",
      "Mentor IA personalizado",
      "Integracao com calendarios",
      "API para desenvolvedores",
      "Comunidade exclusiva",
      "Suporte VIP 24/7",
    ],
    cta: "EM BREVE",
    popular: false,
    highlighted: false,
    disabled: true,
  },
]

export function PricingSection() {
  const [wizardOpen, setWizardOpen] = useState(false)
  const { playSound } = useSoundContext()
  
  const handleOpenWizard = () => {
    playSound("click")
    setWizardOpen(true)
  }

  return (
    <section className="py-20 relative" id="planos">
      {/* Background */}
      <div className="absolute inset-0 pixel-grid opacity-30" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 border-2 border-primary/30 px-4 py-2 rounded-sm mb-6 bg-card/50">
            <div className="w-2 h-2 bg-primary animate-pulse" />
            <span className="text-xs font-mono text-primary tracking-wider">NOSSOS PLANOS</span>
            <div className="w-2 h-2 bg-primary animate-pulse" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Acesse Agora e <span className="text-primary glow-text">Transforme</span> sua Rotina!
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Experimente gratuitamente e descubra como e facil melhorar sua vida!
          </p>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-card border-2 rounded-sm p-6 transition-all duration-300 ${
                plan.highlighted
                  ? "border-primary glow-primary scale-105 md:scale-110 z-10"
                  : plan.disabled
                  ? "border-muted/30 opacity-70"
                  : "border-primary/30 hover:border-primary/50"
              }`}
              onMouseEnter={() => !plan.disabled && playSound("hover")}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 font-mono tracking-wider">
                  MAIS POPULAR
                </div>
              )}

              {/* Pixel corners */}
              <div className={`absolute top-0 left-0 w-4 h-4 ${plan.highlighted ? 'bg-primary' : 'border-l-2 border-t-2 border-primary/50'}`} />
              <div className={`absolute top-0 right-0 w-4 h-4 ${plan.highlighted ? 'bg-primary' : 'border-r-2 border-t-2 border-primary/50'}`} />
              <div className={`absolute bottom-0 left-0 w-4 h-4 ${plan.highlighted ? 'bg-primary' : 'border-l-2 border-b-2 border-primary/50'}`} />
              <div className={`absolute bottom-0 right-0 w-4 h-4 ${plan.highlighted ? 'bg-primary' : 'border-r-2 border-b-2 border-primary/50'}`} />

              {/* Plan header */}
              <div className="text-center mb-6">
                <h3 className={`text-2xl font-bold font-mono mb-2 ${plan.highlighted ? 'text-primary' : 'text-foreground'}`}>
                  {plan.name}
                </h3>
                <p className="text-xs text-muted-foreground">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="text-center mb-6 py-4 border-y-2 border-primary/20">
                <div className="flex items-baseline justify-center gap-1">
                  <span className={`text-4xl md:text-5xl font-bold font-mono ${plan.highlighted ? "text-primary glow-text" : "text-foreground"}`}>
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground text-sm font-mono">{plan.period}</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-3 text-sm">
                    <div className={`w-5 h-5 ${plan.highlighted ? 'bg-primary' : 'bg-primary/20'} flex items-center justify-center shrink-0`}>
                      <Check className={`w-3 h-3 ${plan.highlighted ? 'text-primary-foreground' : 'text-primary'}`} />
                    </div>
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                className={`w-full font-mono text-sm ${
                  plan.highlighted
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground glow-primary"
                    : plan.disabled
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                }`}
                size="lg"
                disabled={plan.disabled}
                onClick={() => {
                  if (!plan.disabled) {
                    handleOpenWizard()
                  }
                }}
              >
                {plan.cta}
                {!plan.disabled && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          ))}
        </div>

        {/* Final CTA */}
        <div className="text-center mt-16">
          <div className="inline-block border-2 border-primary rounded-sm p-1 glow-primary">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-mono text-lg px-12 py-6 h-auto"
              onClick={handleOpenWizard}
            >
              OBTENHA ACESSO ANTECIPADO GRATUITO
              <ArrowRight className="w-5 h-5 ml-3" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-4 font-mono">
            [ SEM CARTAO DE CREDITO NECESSARIO ]
          </p>
        </div>
      </div>
      
      {/* Trial Wizard Dialog */}
      <WizardDialog open={wizardOpen} onOpenChange={setWizardOpen} />
    </section>
  )
}
