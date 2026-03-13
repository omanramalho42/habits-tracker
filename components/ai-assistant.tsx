'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Icons } from './icons'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTIONS = [
  'Qual é minha taxa de conclusão?',
  'Quais hábitos devo focar?',
  'Como posso melhorar minha rotina?',
  'Sugira um novo hábito',
]

export function AIAssistantBadge() {
  const [isOpen, setIsOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! Sou seu assistente de hábitos. Como posso ajudar você hoje?',
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        'Baseado nos seus dados, você completou 72% dos seus hábitos esta semana. Continue assim!',
        'Percebi que você tem sido consistente com exercícios. Que tal adicionar meditação à sua rotina matinal?',
        'Sua melhor sequência é de 15 dias no hábito "Ler". Você está no caminho certo!',
        'Para melhorar sua consistência, sugiro começar com hábitos menores e aumentar gradualmente.',
        'Considerando seus padrões, manhãs parecem ser seu melhor horário para completar hábitos.',
      ]

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsTyping(false)
    }, 1500)
  }

  const toggleListening = () => {
    setIsListening(!isListening)
    // In a real app, this would start/stop voice recognition
    if (!isListening) {
      setTimeout(() => {
        setIsListening(false)
        handleSendMessage('Como está meu progresso hoje?')
      }, 2000)
    }
  }

  return (
    <>
      {/* Floating badge */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-24 right-4 z-40 size-14 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-blue-500/30 flex items-center justify-center hover:scale-105 transition-transform"
          >
            <Icons.sparkles className="size-6 text-white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-20 left-4 right-4 z-50 max-w-md mx-auto bg-card border border-border rounded-3xl shadow-2xl overflow-hidden"
            style={{ maxHeight: 'calc(100vh - 160px)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                  <Icons.sparkles className="size-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Assistente AI</h3>
                  <p className="text-xs text-muted-foreground">Sempre pronto para ajudar</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => setIsOpen(false)}
              >
                <Icons.close className="size-4" />
              </Button>
            </div>

            {/* Messages */}
            <div className="h-64 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-secondary text-secondary-foreground rounded-bl-sm'
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-secondary rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex gap-1">
                      <span className="size-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="size-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="size-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {messages.length <= 2 && (
              <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
                {SUGGESTIONS.slice(0, 2).map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(suggestion)}
                    className="shrink-0 px-3 py-1.5 rounded-full bg-secondary text-xs text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-secondary">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 bg-transparent text-sm outline-none px-2 placeholder:text-muted-foreground"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && inputValue.trim()) {
                      handleSendMessage(inputValue)
                    }
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'size-9 rounded-lg transition-all',
                    isListening && 'bg-red-500/20 text-red-500'
                  )}
                  onClick={toggleListening}
                >
                  {isListening ? (
                    <div className="relative">
                      <Icons.mic className="size-4" />
                      <span className="absolute -top-1 -right-1 size-2 bg-red-500 rounded-full animate-pulse" />
                    </div>
                  ) : (
                    <Icons.mic className="size-4" />
                  )}
                </Button>
                <Button
                  size="icon"
                  className="size-9 rounded-lg"
                  onClick={() => handleSendMessage(inputValue)}
                  disabled={!inputValue.trim()}
                >
                  <Icons.send className="size-4" />
                </Button>
              </div>

              {/* Voice visualization */}
              <AnimatePresence>
                {isListening && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 flex items-center justify-center gap-0.5"
                  >
                    {Array.from({ length: 20 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1 bg-primary rounded-full"
                        animate={{
                          height: [4, Math.random() * 20 + 4, 4],
                        }}
                        transition={{
                          duration: 0.5,
                          repeat: Infinity,
                          delay: i * 0.05,
                        }}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
