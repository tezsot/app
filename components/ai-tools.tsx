'use client'

import {
  ArrowRight,
  BadgeCheck,
  FileText,
  Home,
  Megaphone,
  MessageSquareText,
  Sparkles,
  WandSparkles,
} from 'lucide-react'
import { useState } from 'react'
import { Badge, Group } from '@/components/ios/primitives'
import { cn } from '@/lib/utils'

type Tool = {
  title: string
  description: string
  icon: typeof Sparkles
  tone: string
  status?: string
}

const tools: Tool[] = [
  { title: 'Описание объекта', description: 'Соберите объявление из характеристик объекта', icon: Home, tone: 'bg-blue-100 text-blue-700' },
  { title: 'Текст для клиента', description: 'Подготовьте вежливый ответ или follow-up', icon: MessageSquareText, tone: 'bg-violet-100 text-violet-700' },
  { title: 'Проверка объявления', description: 'Найдите пробелы и неподтверждённые данные', icon: BadgeCheck, tone: 'bg-emerald-100 text-emerald-700', status: 'Скоро' },
  { title: 'Пост для соцсетей', description: 'Адаптируйте объект для Telegram и Instagram', icon: Megaphone, tone: 'bg-amber-100 text-amber-700', status: 'Скоро' },
  { title: 'Чек-лист сделки', description: 'Сформируйте список следующих документов', icon: FileText, tone: 'bg-rose-100 text-rose-700', status: 'Скоро' },
]

export function AiToolsSection() {
  const [selected, setSelected] = useState<string | null>(null)
  const active = tools.find((tool) => tool.title === selected)

  return (
    <section className="px-4 pb-6" aria-labelledby="ai-tools-title">
      <div className="mb-3 flex items-end justify-between px-1">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" aria-hidden />
            <h2 id="ai-tools-title" className="text-[13px] font-medium tracking-wide text-muted-foreground uppercase">AI-инструменты</h2>
          </div>
          <p className="mt-1 text-[13px] text-muted-foreground">Помощь в ежедневной работе агента</p>
        </div>
        <Badge kind="outline">Демо</Badge>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {tools.map((tool) => {
          const Icon = tool.icon
          const disabled = Boolean(tool.status)
          return (
            <button
              key={tool.title}
              type="button"
              disabled={disabled}
              onClick={() => setSelected(tool.title)}
              className={cn(
                'rounded-[20px] bg-card p-4 text-left transition-transform active:scale-[0.98]',
                disabled ? 'cursor-not-allowed opacity-60' : 'hover:bg-card/80',
                tool.title === 'Описание объекта' && 'col-span-2',
              )}
            >
              <span className={cn('flex size-10 items-center justify-center rounded-[14px]', tool.tone)}>
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="mt-3 block text-[15px] font-semibold">{tool.title}</span>
              <span className="mt-1 block text-[12px] leading-snug text-muted-foreground">{tool.description}</span>
              {tool.status ? <span className="mt-2 block text-[11px] font-medium text-muted-foreground">{tool.status}</span> : <ArrowRight className="mt-3 size-4 text-muted-foreground" aria-hidden />}
            </button>
          )
        })}
      </div>
      {active && (
        <div className="anim-fade mt-3 rounded-[20px] bg-primary p-4 text-primary-foreground">
          <div className="flex items-start gap-3">
            <WandSparkles className="mt-0.5 size-5 shrink-0" aria-hidden />
            <div>
              <p className="text-[15px] font-semibold">{active.title}</p>
              <p className="mt-1 text-[13px] leading-snug text-primary-foreground/80">Инструмент подготовит результат после подключения AI. Сейчас это демо-экран — данные не отправляются.</p>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
