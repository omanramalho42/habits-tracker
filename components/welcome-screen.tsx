'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Icons } from './icons'
import { Button } from './ui/button'

interface WelcomeScreenProps {
  userName?: string
  onClose: () => void
  onActionSelect: (action: string) => void
}

const QUICK_ACTIONS = [
  {
    id: 'schedule',
    icon: Icons.calendar,
    title: 'Agendar Atividade',
    description: 'Bloqueie tempo e organize seu dia.',
  },
  {
    id: 'reminder',
    icon: Icons.bell,
    title: 'Criar Lembrete',
    description: 'Mantenha suas tarefas em dia.',
  },
  {
    id: 'habit',
    icon: Icons.check,
    title: 'Adicionar Hábito',
    description: 'Anote antes de esquecer.',
  },
]

export function WelcomeScreen({ userName = 'User', onClose, onActionSelect }: WelcomeScreenProps) {
  const [inputValue, setInputValue] = useState('')
  const [greeting, setGreeting] = useState('Olá')

  // Set greeting on client side only to avoid hydration mismatch
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) {
      setGreeting('Bom dia')
    } else if (hour < 18) {
      setGreeting('Boa tarde')
    } else {
      setGreeting('Boa noite')
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl"
      >
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="size-10 rounded-full bg-secondary"
          onClick={onClose}
        >
          <Icons.close className="size-5" />
        </Button>

        {/* AI Badge */}
        <div className="mt-6 mb-4">
          <div className="size-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
            <Icons.sparkles className="size-6 text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-balance">
          {/* {getGreeting()} <span className="text-foreground">{userName}</span>, pronto para{' '} */}
          <span className="text-primary">planejar seu dia</span>?
        </h1>

        {/* Quick actions */}
        <div className="mt-6 space-y-2">
          <p className="text-sm text-muted-foreground">Coisas que você pode fazer</p>
          
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.id}
              onClick={() => onActionSelect(action.id)}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors text-left group"
            >
              <div className="size-10 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <action.icon className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm">{action.title}</h3>
                <p className="text-xs text-muted-foreground truncate">{action.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Input field */}
        <div className="mt-6 flex items-center gap-2 p-2 rounded-xl bg-secondary border border-border">
          <Button variant="ghost" size="icon" className="size-8 shrink-0">
            <Icons.plus className="size-4" />
          </Button>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Pergunte qualquer coisa"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && inputValue.trim()) {
                onActionSelect('chat')
              }
            }}
          />
          <Button variant="ghost" size="icon" className="size-8 shrink-0 text-primary">
            <Icons.mic className="size-4" />
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
