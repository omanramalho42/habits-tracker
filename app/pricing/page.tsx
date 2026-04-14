"use client"

import { useState } from "react"
import axios from "axios"
import { Loader2 } from "lucide-react"

const planos = [
  {
    nome: "Gratuito",
    preco: 0,
    descricao: "Perfeito para começar sua evolução",
    features: [
      "Acesso às funções básicas",
      "1 assistente",
      "Monitoramento simples",
      "Suporte básico"
    ],
    priceId: null
  },
  {
    nome: "Pro",
    preco: 19,
    descricao: "Para quem leva evolução a sério",
    destaque: true,
    features: [
      "Acesso completo",
      "Até 10 usuários",
      "50GB de dados",
      "Suporte prioritário"
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID
  },
  {
    nome: "Premium",
    preco: 49,
    descricao: "Performance máxima e sem limites",
    features: [
      "Tudo liberado",
      "Usuários ilimitados",
      "100GB+ de dados",
      "Suporte VIP prioritário"
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID
  }
]

export default function PaginaPlanos() {
  const [loading, setLoading] = useState<string | null>(null)

  const handleCheckout = async (priceId: string | null, plano: string) => {
    if (!priceId) return

    try {
      setLoading(plano)

      const { data } = await axios.post("/api/stripe/checkout", {
        priceId,
        plan: plano.toUpperCase()
      })

      window.location.href = data.url
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col items-center justify-center px-6 py-20">
      
      {/* HEADER */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold">
          Escolha seu plano
        </h1>
        <p className="text-white/40 mt-2">
          Desbloqueie o próximo nível da sua evolução
        </p>
      </div>

      {/* PLANOS */}
      <div className="grid md:grid-cols-3 gap-8 w-full max-w-6xl">
        {planos.map((plano) => (
          <div
            key={plano.nome}
            className={`
              relative p-6 rounded-2xl border transition-all
              ${plano.destaque
                ? "border-purple-500 shadow-[0_0_40px_rgba(168,85,247,0.3)] scale-105 bg-linear-to-b from-purple-600/10 to-transparent"
                : "border-white/10 bg-white/5"
              }
            `}
          >
            {plano.destaque && (
              <span className="absolute top-4 right-4 text-xs bg-purple-500 px-2 py-1 rounded-full">
                MAIS POPULAR
              </span>
            )}

            <h3 className="text-lg font-semibold mb-2">{plano.nome}</h3>

            <div className="text-4xl font-bold mb-4">
              R${plano.preco}
              <span className="text-sm text-white/40">/mês</span>
            </div>

            <p className="text-white/40 mb-6">
              {plano.descricao}
            </p>

            <ul className="space-y-3 mb-8">
              {plano.features.map((feature, i) => (
                <li key={i} className="text-sm text-white/70 flex items-center gap-2">
                  <span className="text-purple-400">✔</span>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleCheckout(plano.priceId!, plano.nome)}
              className={`
                w-full h-11 rounded-xl font-medium transition-all
                ${plano.destaque
                  ? "bg-purple-600 hover:bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.5)]"
                  : "bg-white/10 hover:bg-white/20"
                }
              `}
            >
              {loading === plano.nome ? (
                <Loader2 className="animate-spin mx-auto" />
              ) : (
                plano.preco === 0 ? "Começar grátis" : "Assinar agora"
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}