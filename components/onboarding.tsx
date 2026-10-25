'use client'

import { useState } from 'react'
import { ArrowRight, Users, CalendarCheck, Sparkles, House } from 'lucide-react'

const slides = [
  { icon: House, label: 'ВАШ РАБОЧИЙ ДЕНЬ', title: 'Меньше рутины.\nБольше сделок.', text: 'Маклер объединяет клиентов, объекты и договорённости. Всё важное — в одном месте.', items: ['Клиенты и их запросы', 'Объекты и актуальные цены', 'Сделки и комиссии'] },
  { icon: CalendarCheck, label: 'НИКОГО НЕ ПОТЕРЯТЬ', title: 'У каждого клиента\nесть следующий шаг.', text: 'Планируйте звонки и показы. Экран «Сегодня» поможет увидеть, кому нужно уделить внимание.', items: ['Ближайшие встречи', 'Задачи без лишних списков', 'История общения под рукой'] },
  { icon: Sparkles, label: 'ПОМОЩЬ В РАБОТЕ', title: 'AI готовит черновик.\nРешение — за вами.', text: 'Объявления, ответы клиентам и подготовка к показам. Проверяйте результат перед использованием.', items: ['Тексты на русском и узбекском', 'Контекст выбранных объектов', 'Никаких автоматических отправок'] },
]

export function Onboarding({ onComplete }: { onComplete: (destination: 'home' | 'clients' | 'properties' | 'ai') => void }) {
  const [step, setStep] = useState(0)
  const [destination, setDestination] = useState<'home' | 'clients' | 'properties' | 'ai'>('home')
  const slide = slides[step]
  const options = [
    { id: 'home', icon: CalendarCheck, title: 'Разобраться в рабочем дне', text: 'Задачи, встречи и приоритеты' },
    { id: 'clients', icon: Users, title: 'Начать с клиентов', text: 'Контакты, запросы и следующий шаг' },
    { id: 'properties', icon: House, title: 'Посмотреть объекты', text: 'Каталог недвижимости и подбор' },
    { id: 'ai', icon: Sparkles, title: 'Попробовать AI-инструменты', text: 'Тексты и подготовка к общению' },
  ] as const
  return <main className="absolute inset-0 flex flex-col bg-background pt-[var(--top)] pb-[var(--bottom)]">
    <header className="flex shrink-0 items-center justify-between px-6 py-3">
      <span className="text-lg font-bold tracking-tight">Маклер<span className="text-primary">.</span></span>
      <button className="min-h-11 px-2 text-sm text-muted-foreground" onClick={() => onComplete('home')}>Пропустить</button>
    </header>
    <div className="min-h-0 flex-1 overflow-y-auto px-6 py-3" aria-live="polite">
      {slide ? <section key={step}>
        <div className="mb-5 flex h-24 items-center gap-4 rounded-3xl bg-primary/10 px-6 text-primary"><slide.icon className="size-12" strokeWidth={1.5} aria-hidden /><div><p className="text-sm font-semibold">Всё связано</p><p className="mt-1 text-xs">Клиент → показ → сделка</p></div></div>
        <p className="text-[11px] font-semibold tracking-widest text-muted-foreground">{slide.label}</p>
        <h1 className="mt-3 whitespace-pre-line text-[30px] font-semibold leading-tight tracking-tight">{slide.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{slide.text}</p>
        <ul className="mt-5 space-y-2 text-sm">{slide.items.map(item => <li key={item} className="flex items-center gap-3"><span className="size-1.5 rounded-full bg-primary" aria-hidden />{item}</li>)}</ul>
      </section> : <section>
        <p className="text-xs font-medium text-primary">ПОДСТРОИМ ПЕРВЫЙ ШАГ</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">С чего начнём?</h1>
        <p className="mt-2 text-sm text-muted-foreground">Выберите стартовый раздел. Все остальные тоже будут доступны.</p>
        <fieldset className="mt-5 space-y-2"><legend className="sr-only">Стартовый раздел</legend>{options.map(option => <label key={option.id} className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3 ${destination === option.id ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
          <input type="radio" name="destination" value={option.id} checked={destination === option.id} onChange={() => setDestination(option.id)} className="accent-primary" />
          <option.icon className="size-5 shrink-0 text-primary" aria-hidden /><span><span className="block text-sm font-medium">{option.title}</span><span className="block text-xs text-muted-foreground">{option.text}</span></span>
        </label>)}</fieldset>
      </section>}
    </div>
    <footer className="shrink-0 border-t border-border px-6 py-4">
      <div className="mb-3 flex items-center justify-between"><span className="text-xs text-muted-foreground">{step + 1} из 4</span><div className="flex gap-1.5" aria-hidden>{[0,1,2,3].map(i => <span key={i} className={`h-1.5 rounded-full ${i === step ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/25'}`} />)}</div></div>
      <div className="flex gap-3">{step > 0 && <button onClick={() => setStep(step - 1)} className="min-h-12 rounded-xl border border-border px-4 text-sm">Назад</button>}<button onClick={() => step < 3 ? setStep(step + 1) : onComplete(destination)} className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">{step === 3 ? 'Открыть рабочее место' : 'Продолжить'}<ArrowRight className="size-4" aria-hidden /></button></div>
      <p className="mt-3 text-center text-[11px] leading-relaxed text-muted-foreground">Демо с примерами данных. Настройки не сохраняются после перезагрузки.</p>
    </footer>
  </main>
}
