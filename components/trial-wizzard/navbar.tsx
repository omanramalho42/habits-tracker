"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, Zap } from "lucide-react"
import { useSoundContext } from "./sound-provider"
import { useRouter } from "next/navigation"

const navLinks = [
  { label: "Funcionalidades", href: "#funcionalidades" },
  { label: "Como Funciona", href: "#como-funciona" },
  { label: "Preview", href: "#preview" },
  { label: "Planos", href: "#planos" },
]

export function Navbar() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const { playSound } = useSoundContext()

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-md border-b-2 border-primary/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-2 group"
            onMouseEnter={() => playSound("hover")}
          >
            <div className="relative">
              <Image
                src="/logo.png"
                alt="LABHABIT Logo"
                width={36}
                height={36}
                className="group-hover:scale-110 transition-transform"
              />
            </div>
            <span className="text-lg font-bold font-mono">
              LAB<span className="text-primary">HABIT</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-primary transition-colors font-mono relative group"
                onMouseEnter={() => playSound("hover")}
              >
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-primary">{"["}</span>
                {link.label}
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-primary">{"]"}</span>
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Button 
              variant="ghost" 
              className="text-sm font-mono text-muted-foreground hover:text-primary"
              onMouseEnter={() => playSound("hover")}
              onClick={() => router.push("/sign-in")}
            >
              Entrar
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-mono glow-primary"
              onClick={() => playSound("click")}
            >
              <Zap className="w-4 h-4 mr-1" />
              Comecar Gratis
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 border border-primary/30 hover:border-primary transition-colors"
            onClick={() => {
              setIsOpen(!isOpen)
              playSound("click")
            }}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-5 h-5 text-primary" /> : <Menu className="w-5 h-5 text-primary" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t-2 border-primary/20 bg-card/50">
            <div className="flex flex-col gap-2">
              {navLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors py-3 px-4 font-mono border-l-2 border-transparent hover:border-primary hover:bg-primary/5"
                  onClick={() => {
                    setIsOpen(false)
                    playSound("click")
                  }}
                >
                  {">"} {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-4 mt-2 border-t-2 border-primary/20">
                <Button
                  onClick={() => router.push("/sign-in")}
                  variant="ghost"
                  className="justify-start font-mono"
                >
                  Entrar
                </Button>
                <Button 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-mono"
                  onClick={() => playSound("click")}
                >
                  <Zap className="w-4 h-4 mr-1" />
                  Comecar Gratis
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
