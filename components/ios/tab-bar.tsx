'use client'

import { Building2, Ellipsis, Handshake, Search, Sun, Users, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type Tab, useStore } from '@/lib/store'

const TABS: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: 'home', label: 'Главная', icon: Sun },
  { id: 'clients', label: 'Клиенты', icon: Users },
  { id: 'properties', label: 'Объекты', icon: Building2 },
  { id: 'deals', label: 'Сделки', icon: Handshake },
  { id: 'more', label: 'Ещё', icon: Ellipsis },
]

export function TabBar() {
  const { tab, setTab, openSheet, tasks } = useStore()
  const urgent = tasks.filter((t) => !t.done && t.bucket === 'overdue').length

  return (
    <nav
      aria-label="Основная навигация"
      className="absolute inset-x-0 bottom-0 z-30 flex items-end gap-2.5 px-4 pb-[calc(var(--bottom)+2px)]"
    >
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background via-background/60 to-transparent" />
      <div className="glass relative flex h-[62px] flex-1 items-center rounded-full p-1">
        {TABS.map((t) => {
          const active = tab === t.id
          const Icon = t.icon
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex h-full flex-1 flex-col items-center justify-center gap-0.5 rounded-full transition-colors duration-200',
                active ? 'bg-foreground/[0.07] text-foreground' : 'text-muted-foreground',
              )}
            >
              <Icon className="size-[22px]" strokeWidth={active ? 2.25 : 1.9} aria-hidden />
              <span className={cn('text-[10px] leading-none', active ? 'font-semibold' : 'font-medium')}>{t.label}</span>
              {t.id === 'home' && urgent > 0 && (
                <span className="absolute top-1.5 right-[calc(50%-18px)] flex size-[17px] items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-white tabular-nums">
                  <span className="sr-only">Срочных: </span>
                  {urgent}
                </span>
              )}
            </button>
          )
        })}
      </div>
      <button
        type="button"
        onClick={() => openSheet({ type: 'search' })}
        aria-label="Поиск"
        className="press glass relative flex size-[62px] shrink-0 items-center justify-center rounded-full"
      >
        <Search className="size-[22px]" strokeWidth={2} aria-hidden />
      </button>
    </nav>
  )
}
