"use client"

import Image from "next/image"
import Link from "next/link"
import { Instagram, Twitter, MessageCircle } from "lucide-react"
import { useSoundContext } from "./sound-provider"

const footerLinks = {
  produto: [
    { label: "Funcionalidades", href: "#funcionalidades" },
    { label: "Planos", href: "#planos" },
    { label: "Roadmap", href: "#" },
  ],
  legal: [
    { label: "Termos", href: "#" },
    { label: "Privacidade", href: "#" },
    { label: "Contato", href: "#" },
  ],
}

const socialLinks = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: MessageCircle, href: "#", label: "Discord" },
]

export function Footer() {
  const { playSound } = useSoundContext()

  return (
    <footer className="border-t-2 border-primary/20 bg-card/30 relative">
      {/* Pixel decoration top */}
      <div className="absolute top-0 left-0 w-full h-1 flex">
        {Array.from({ length: 100 }).map((_, i) => (
          <div 
            key={i} 
            className={`flex-1 h-full ${i % 5 === 0 ? 'bg-primary/40' : 'bg-transparent'}`}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/logo.png"
                alt="LABHABIT Logo"
                width={48}
                height={48}
              />
              <span className="text-2xl font-bold font-mono">
                LAB<span className="text-primary">HABIT</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm font-mono">
              {">"} A evolucao pessoal encontra a inteligencia artificial. Transforme seus habitos, transforme sua vida.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-10 h-10 bg-card border-2 border-primary/30 flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all group"
                  aria-label={social.label}
                  onMouseEnter={() => playSound("hover")}
                >
                  <social.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>
          </div>

          {/* Produto */}
          <div>
            <h4 className="font-bold text-primary mb-4 text-sm font-mono tracking-wider">[PRODUTO]</h4>
            <ul className="space-y-2">
              {footerLinks.produto.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors font-mono"
                    onMouseEnter={() => playSound("hover")}
                  >
                    {">"} {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-primary mb-4 text-sm font-mono tracking-wider">[LEGAL]</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors font-mono"
                    onMouseEnter={() => playSound("hover")}
                  >
                    {">"} {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t-2 border-primary/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground font-mono">
            (C) 2026 LABHABIT. Todos os direitos reservados.
          </p>
          <p className="text-xs text-muted-foreground font-mono">
            Feito com <span className="text-primary animate-pulse">{"<3"}</span> para sua evolucao
          </p>
        </div>
      </div>
    </footer>
  )
}
