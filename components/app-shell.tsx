'use client'

import { BatteryFull, SignalHigh, Wifi } from 'lucide-react'
import { useState } from 'react'
import { Onboarding } from '@/components/onboarding'
import { TabBar } from '@/components/ios/tab-bar'
import { AiToolsScreen } from '@/components/ai-tools'
import { MarketScreen } from '@/components/screens/market'
import { ToastHost } from '@/components/ios/toast'
import { ClientDetail, ClientsScreen } from '@/components/screens/clients'
import { DealDetail, DealsScreen } from '@/components/screens/deals'
import { HomeScreen } from '@/components/screens/home'
import {
  AnalyticsScreen,
  DocsListScreen,
  DocsScreen,
  LegalScreen,
  MoreScreen,
  SettingsScreen,
} from '@/components/screens/more'
import { PropertiesScreen, PropertyDetail } from '@/components/screens/properties'
import { ShowingsScreen, TasksScreen } from '@/components/screens/work'
import { SheetHost } from '@/components/sheets'
import { type Route, type Tab, StoreProvider, useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const ROOTS: Record<Tab, () => React.ReactNode> = {
  home: () => <HomeScreen />,
  clients: () => <ClientsScreen />,
  properties: () => <PropertiesScreen />,
  deals: () => <DealsScreen />,
  more: () => <MoreScreen />,
}

function renderRoute(r: Route) {
  switch (r.name) {
    case 'market':
      return <MarketScreen />
    case 'ai':
      return <AiToolsScreen />
    case 'client':
      return <ClientDetail id={r.id} />
    case 'property':
      return <PropertyDetail id={r.id} />
    case 'deal':
      return <DealDetail id={r.id} />
    case 'docs':
      return <DocsScreen id={r.id} />
    case 'tasks':
      return <TasksScreen taskId={r.taskId} />
    case 'showings':
      return <ShowingsScreen />
    case 'legal':
      return <LegalScreen />
    case 'docsList':
      return <DocsListScreen />
    case 'analytics':
      return <AnalyticsScreen />
    case 'settings':
      return <SettingsScreen />
  }
}

function StatusBar() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-[90] hidden h-[54px] items-center justify-between px-8 pt-1 md:flex">
      <span className="text-[16px] font-semibold tabular-nums">9:41</span>
      <span className="absolute top-[11px] left-1/2 h-[34px] w-[124px] -translate-x-1/2 rounded-full bg-black" />
      <span className="flex items-center gap-1.5">
        <SignalHigh className="size-[18px]" strokeWidth={2.5} aria-hidden />
        <Wifi className="size-[17px]" strokeWidth={2.5} aria-hidden />
        <BatteryFull className="size-6" strokeWidth={1.75} aria-hidden />
      </span>
    </div>
  )
}

function Phone() {
  const { tab, stacks, theme, setTab, push } = useStore()
  const [introduced, setIntroduced] = useState(false)
  const stack = stacks[tab]
  return (
    <div
      className={cn(
        theme === 'dark' && 'dark',
        'fixed inset-0 overflow-hidden bg-background text-foreground [--bottom:env(safe-area-inset-bottom)] [--top:env(safe-area-inset-top)]',
        'md:relative md:inset-auto md:h-[852px] md:w-[393px] md:shrink-0 md:rounded-[56px] md:shadow-[0_0_0_11px_#1a1a1a,0_0_0_13px_#3a3a3a,0_40px_80px_-20px_rgb(0_0_0/0.45)] md:[--bottom:20px] md:[--top:54px]',
      )}
    >
      <StatusBar />
      {!introduced ? <Onboarding onComplete={destination => {
        if (destination === 'ai') push({ name: 'ai' })
        else setTab(destination)
        setIntroduced(true)
      }} /> : <>
      <main className="absolute inset-0" key={tab}>
        <div className={cn('absolute inset-0', stack.length > 0 && 'pointer-events-none')} aria-hidden={stack.length > 0}>
          {ROOTS[tab]()}
        </div>
        {stack.map((r, i) => (
          <div
            key={`${r.name}-${'id' in r ? r.id : ''}-${i}`}
            className={cn(
              'anim-push absolute inset-0 shadow-[-12px_0_32px_rgb(0_0_0/0.08)]',
              i < stack.length - 1 && 'pointer-events-none',
            )}
            aria-hidden={i < stack.length - 1}
          >
            {renderRoute(r)}
          </div>
        ))}
      </main>
      <TabBar />
      <ToastHost />
      <SheetHost />
      </>}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-2 left-1/2 z-[95] hidden h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-foreground/80 md:block"
      />
    </div>
  )
}

const PRINCIPLES = [
  { t: 'Сначала главное', d: 'Экран «Сегодня» показывает, что сделать сейчас, и даёт кнопку действия рядом с причиной.' },
  { t: 'Следующий шаг всегда есть', d: 'После звонка или показа приложение само предлагает задачу — клиенты не теряются.' },
  { t: 'Быстрый ввод', d: 'Клиент — за имя и телефон, объект — за тип, район и цену. Детали позже.' },
  { t: 'Доверие к данным', d: 'Каждый объект показывает, когда его проверяли. Устаревшее подсвечено.' },
]

function DesktopAside() {
  return (
    <aside className="hidden max-w-sm flex-col gap-8 lg:flex">
      <div>
        <p className="text-[13px] font-medium tracking-wide text-neutral-500 uppercase">Прототип · iOS 26</p>
        <h1 className="mt-2 text-[40px] leading-[1.05] font-bold text-neutral-900">Маклер</h1>
        <p className="mt-3 text-[17px] leading-relaxed text-neutral-600">
          Рабочее место риэлтора в Узбекистане: клиенты, объекты, показы, сделки, комиссии и маршрут легализации — в
          одном кармане.
        </p>
      </div>
      <ul className="flex flex-col gap-5">
        {PRINCIPLES.map((p, i) => (
          <li key={p.t} className="flex gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-[13px] font-semibold text-white">
              {i + 1}
            </span>
            <span>
              <span className="block text-[15px] font-semibold text-neutral-900">{p.t}</span>
              <span className="block text-[14px] leading-snug text-neutral-600">{p.d}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="text-[13px] leading-relaxed text-neutral-500">
        Попробуйте: нажмите «Позвонить» в блоке «Требует внимания», завершите звонок и выберите итог — следующий шаг
        создастся автоматически.
      </p>
    </aside>
  )
}

export function AppShell() {
  return (
    <StoreProvider>
      <div className="flex min-h-dvh items-center justify-center gap-20 md:p-10">
        <DesktopAside />
        <Phone />
      </div>
    </StoreProvider>
  )
}
