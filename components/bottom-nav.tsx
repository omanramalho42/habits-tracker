'use client'

import { cn } from '@/lib/utils'
import { useHabitsStore } from '@/lib/store'
import type { TabView } from '@/lib/types'
import { Icons } from './icons'

const navItems: { id: TabView; label: string; icon: keyof typeof Icons }[] = [
  { id: 'home', label: 'Início', icon: 'home' },
  { id: 'calendar', label: 'Calendário', icon: 'calendar' },
  { id: 'stats', label: 'Estatísticas', icon: 'stats' },
  { id: 'settings', label: 'Ajustes', icon: 'settings' },
]

export function BottomNav() {
  const { activeTab, setActiveTab } = useHabitsStore()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-area-pb">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = Icons[item.icon]
          const isActive = activeTab === item.id

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className={cn('size-5', isActive && 'stroke-[2.5px]')} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
