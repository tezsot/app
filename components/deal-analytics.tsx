'use client'

import { useState } from 'react'
import { DEAL_STAGES, money } from '@/lib/data'
import { useStore } from '@/lib/store'
import { Group, Row, Screen } from '@/components/ios/primitives'

export function DealAnalytics() {
  const s = useStore()
  const [filter, setFilter] = useState<'all' | 'expected' | 'received' | 'cancelled' | number>('all')
  const active = s.deals.filter(d => !d.cancellation)
  const share = (d: typeof s.deals[number]) => Math.max(0, Math.min(100, d.commission.split.find(p => p.name === 'Вы')?.share ?? 100)) / 100
  const pending = (d: typeof s.deals[number]) => d.cancellation ? 0 : Math.max(0, d.commission.amount - d.commission.received) * share(d)
  const paid = (d: typeof s.deals[number]) => Math.max(0, d.commission.received) * share(d)
  const expected = s.deals.reduce((sum, d) => sum + pending(d), 0)
  const received = s.deals.reduce((sum, d) => sum + paid(d), 0)
  const closed = active.filter(d => d.stage === DEAL_STAGES.length - 1).length
  const visible = s.deals.filter(d => typeof filter === 'number' ? !d.cancellation && d.stage === filter : filter === 'expected' ? pending(d) > 0 : filter === 'received' ? paid(d) > 0 : filter === 'cancelled' ? !!d.cancellation : true)
  const label = typeof filter === 'number' ? DEAL_STAGES[filter] : { all: 'Все сделки', expected: 'С ожидаемой комиссией', received: 'С полученной комиссией', cancelled: 'Отменённые сделки' }[filter]
  return <Screen title="Аналитика сделок" subtitle="Текущее состояние демо" back onBack={s.pop}>
    <p className="px-4 pb-4 text-sm text-muted-foreground">Расчёт по записям этой сессии, не банковская выписка. Комиссии — ваша доля в USD. Переключатель роли не меняет состав данных.</p>
    <div className="grid grid-cols-2 gap-3 px-4 pb-5">{([
      ['expected', 'Осталось получить', money(expected)], ['received', 'Получено', money(received)], ['all', 'Всего сделок', String(s.deals.length)], ['cancelled', 'Отменено', String(s.deals.length - active.length)],
    ] as const).map(([key, title, value]) => <button key={key} aria-pressed={filter === key} onClick={() => setFilter(key)} className={`min-h-24 rounded-2xl border p-4 text-left ${filter === key ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}><span className="block text-sm text-muted-foreground">{title}</span><span className="mt-2 block break-words text-xl font-semibold tabular-nums">{value}</span><span className="mt-2 block text-xs text-muted-foreground">Посмотреть сделки</span></button>)}</div>
    <Group header="Сделки по текущему этапу" footer="Это распределение по этапам, не конверсионная воронка: история переходов не содержит структурированных дат.">{DEAL_STAGES.map((stage, i) => <Row key={stage} title={stage} value={String(active.filter(d => d.stage === i).length)} onClick={() => setFilter(i)} />)}</Group>
    <div className="mx-4 mb-5 rounded-2xl border border-border p-4"><p className="text-sm font-medium">Доля закрытых среди неотменённых</p><p className="mt-2 text-2xl font-semibold tabular-nums">{active.length ? `${Math.round(closed / active.length * 100)}%` : '—'}</p><p className="mt-1 text-xs text-muted-foreground">{closed} из {active.length}. Не является конверсией обращений в сделки. Полученные суммы учитываются и у отменённых сделок; ожидаемые — нет.</p></div>
    <Group header={`${label} · ${visible.length}`} footer="Без дат платежей и закрытия нельзя достоверно построить отчёт за период. Скорость ответа и персональная статистика команды не рассчитываются.">
      {!visible.length && <p className="p-4 text-sm text-muted-foreground">Нет сделок по выбранному показателю.</p>}
      {visible.map(d => <Row key={d.id} title={s.clients.find(c => c.id === d.clientId)?.name ?? 'Клиент не найден'} subtitle={`${d.cancellation ? 'Отменена' : DEAL_STAGES[d.stage]} · Получено ${money(paid(d))} · Остаток ${money(pending(d))}`} onClick={() => s.push({ name: 'deal', id: d.id })} />)}
    </Group>
  </Screen>
}
