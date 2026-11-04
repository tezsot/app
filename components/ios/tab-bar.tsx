'use client'

import { useEffect, useRef, useState } from 'react'
import { Building2, Ellipsis, Handshake, Search, Sun, Users, X, type LucideIcon } from 'lucide-react'
import { GlobalSearchResults } from '@/components/sheets'
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
  const { tab, setTab, tasks } = useStore()
  const [searching, setSearching] = useState(false)
  const [query, setQuery] = useState('')
  const [keyboardInset, setKeyboardInset] = useState(0)
  const trigger = useRef<HTMLButtonElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const closeSearch = () => { setSearching(false); setQuery(''); requestAnimationFrame(() => trigger.current?.focus()) }
  useEffect(() => {
    if (!searching) return
    const main = input.current?.closest('[role="dialog"]')?.parentElement?.querySelector('main')
    const wasInert = main?.inert ?? false
    if (main) main.inert = true
    const viewport = window.visualViewport
    const update = () => setKeyboardInset(viewport ? Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop) : 0)
    update()
    viewport?.addEventListener('resize', update)
    viewport?.addEventListener('scroll', update)
    return () => { if (main) main.inert = wasInert; viewport?.removeEventListener('resize', update); viewport?.removeEventListener('scroll', update) }
  }, [searching])
  const urgent = tasks.filter((t) => !t.done && t.bucket === 'overdue').length

  if (searching) return <section role="dialog" aria-modal="true" aria-labelledby="global-search-title" className="absolute inset-0 z-30 flex flex-col bg-background" style={{ bottom: keyboardInset }} onKeyDown={event => {
    if (event.key === 'Escape') { event.preventDefault(); closeSearch() }
    if (event.key === 'Tab') {
      const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), input, [tabindex="0"]'))
      const first = controls[0]; const last = controls[controls.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }
  }}>
    <header className="px-6 pb-4 pt-[calc(var(--top)+20px)]"><h2 id="global-search-title" className="text-3xl font-bold tracking-tight">Поиск</h2><p className="mt-1 text-sm text-muted-foreground">По всей вашей базе</p></header>
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-4">
      {!query.trim() && <div className="mx-4 mb-6 flex flex-col gap-4 rounded-[24px] bg-secondary/60 p-5"><p className="text-sm font-medium">Что найдём?</p><div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">{[{ icon: Users, text: 'Клиенты и телефоны' }, { icon: Building2, text: 'Объекты и адреса' }, { icon: Sun, text: 'Задачи' }, { icon: Handshake, text: 'Сделки' }].map(({icon: Icon, text}) => <span key={text} className="flex items-center gap-2"><Icon className="size-5 shrink-0" aria-hidden />{text}</span>)}</div></div>}
      <GlobalSearchResults q={query} onNavigate={() => { setSearching(false); setQuery('') }} />
    </div>
    <div className="flex shrink-0 items-center gap-2 px-4 pt-3" style={{ paddingBottom: keyboardInset > 0 ? 12 : 'calc(var(--bottom) + 2px)' }}>
      <div className="glass flex h-[62px] min-w-0 flex-1 items-center gap-2 rounded-full px-4 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200">
        <Search className="size-[22px] shrink-0 text-muted-foreground" aria-hidden />
        <input ref={input} autoFocus type="search" aria-label="Поиск по всей базе" placeholder="Имя, телефон, адрес…" value={query} onChange={e => setQuery(e.target.value)} className="min-w-0 flex-1 bg-transparent text-base outline-none [&::-webkit-search-cancel-button]:hidden" />
        {query && <button type="button" aria-label="Очистить поиск" onClick={() => { setQuery(''); input.current?.focus() }} className="flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground"><X className="size-5" aria-hidden /></button>}
      </div>
      <button type="button" onClick={closeSearch} className="min-h-11 shrink-0 px-1 text-sm font-medium text-primary">Отмена</button>
    </div>
  </section>

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
        ref={trigger}
        onClick={() => { setKeyboardInset(0); setSearching(true) }}
        aria-label="Поиск"
        aria-haspopup="dialog"
        className="press glass relative flex size-[62px] shrink-0 items-center justify-center rounded-full"
      >
        <Search className="size-[22px]" strokeWidth={2} aria-hidden />
      </button>
    </nav>
  )
}
