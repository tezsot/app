'use client'

import { useReducer, useState } from 'react'
import { Coins, Gift, GraduationCap, Trophy, CheckCircle2 } from 'lucide-react'
import { Screen } from '@/components/ios/primitives'

const missions = [
  { title: 'Подготовить объект', detail: 'Заполнить характеристики, проверить описание и фотографии.', coins: 15 },
  { title: 'Провести показ', detail: 'Зафиксировать результат и согласованный следующий шаг.', coins: 25 },
  { title: 'Пройти обучение', detail: 'Завершить учебный модуль и практическое задание.', coins: 10 },
] as const
const prizes = [{ title: 'Кофе за хороший старт', price: 25 }, { title: 'Обед за счёт агентства', price: 50 }, { title: 'Профессиональный мастер-класс', price: 150 }]
type State = { tasks: ('open' | 'pending' | 'approved' | 'rejected')[]; balance: number; xp: number; orders: { prize: number; status: 'reserved' | 'delivered' | 'cancelled' }[]; history: string[] }
const initial: State = { tasks: ['open', 'open', 'open'], balance: 0, xp: 0, orders: [], history: [] }
type Action = { type: 'submit' | 'approve' | 'reject' | 'redeem' | 'deliver' | 'cancel'; index: number; reason?: string } | { type: 'reset' }
function reducer(s: State, a: Action): State {
  if (a.type === 'reset') return initial
  const i = a.index
  const log = (message: string) => [message, ...s.history]
  if (a.type === 'submit' && s.tasks[i] === 'open') return { ...s, tasks: s.tasks.map((v, n) => n === i ? 'pending' : v), history: log(`На проверке: ${missions[i].title}`) }
  if (a.type === 'approve' && s.tasks[i] === 'pending') return { ...s, tasks: s.tasks.map((v, n) => n === i ? 'approved' : v), balance: s.balance + missions[i].coins, xp: s.xp + missions[i].coins, history: log(`+${missions[i].coins} coins · ${missions[i].title}`) }
  if (a.type === 'reject' && s.tasks[i] === 'pending' && a.reason?.trim()) return { ...s, tasks: s.tasks.map((v, n) => n === i ? 'rejected' : v), history: log(`Отклонено: ${missions[i].title}. Причина: ${a.reason.trim()}`) }
  if (a.type === 'redeem' && prizes[i] && s.balance >= prizes[i].price) return { ...s, balance: s.balance - prizes[i].price, orders: [...s.orders, { prize: i, status: 'reserved' }], history: log(`Резерв ${prizes[i].price} coins · ${prizes[i].title}`) }
  const order = s.orders[i]
  if ((a.type === 'cancel' || a.type === 'deliver') && order?.status === 'reserved') return { ...s, balance: s.balance + (a.type === 'cancel' ? prizes[order.prize].price : 0), orders: s.orders.map((o, n) => n === i ? { ...o, status: a.type === 'cancel' ? 'cancelled' : 'delivered' } : o), history: log(`${a.type === 'cancel' ? 'Отмена: coins возвращены' : 'Награда выдана'} · ${prizes[order.prize].title}`) }
  return s
}
const button = 'rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:opacity-40'

export function RewardsScreen() {
  const [state, dispatch] = useReducer(reducer, initial)
  const [manager, setManager] = useState(false)
  const [tab, setTab] = useState('Задания')
  const [reason, setReason] = useState('')
  const [reset, setReset] = useState(false)
  const reserved = state.orders.reduce((n, o) => n + (o.status === 'reserved' ? prizes[o.prize].price : 0), 0)
  const pending = state.tasks.reduce((n, t, i) => n + (t === 'pending' ? missions[i].coins : 0), 0)
  return <Screen title="Достижения" back>
    <div className="space-y-4 px-4 pb-8">
      <p className="rounded-xl bg-muted p-3 text-xs text-muted-foreground">Демо · вымышленные задания и награды. Переключение ролей не является авторизацией. Прогресс сбрасывается при выходе из раздела; реальных выплат нет.</p>
      <section className="rounded-3xl bg-primary p-5 text-primary-foreground"><div className="flex items-center justify-between"><span className="text-sm">Ваши coins</span><Coins aria-hidden="true" className="size-6" /></div><p className="mt-2 text-4xl font-semibold tabular-nums" aria-live="polite">{state.balance}</p><p className="mt-1 text-xs opacity-80">Доступно для обмена</p><div className="mt-5 flex gap-6 text-sm"><span>На проверке <strong>{pending}</strong></span><span>В резерве <strong>{reserved}</strong></span></div></section>
      <section className="rounded-2xl bg-card p-4"><div className="flex items-center gap-3"><Trophy aria-hidden="true" className="size-6 text-amber-600"/><div><h2 className="font-semibold">{state.xp >= 50 ? 'Уверенный старт' : 'Первый шаг'}</h2><p className="text-xs text-muted-foreground">{state.xp} XP · опыт не тратится при обмене</p></div></div><progress className="mt-3 h-2 w-full accent-primary" value={Math.min(state.xp, 50)} max={50} aria-label="Прогресс до уровня Уверенный старт"/><p className="mt-1 text-xs text-muted-foreground">Цель: 50 XP. Только подтверждённые результаты.</p></section>
      <label className="flex items-center justify-between gap-3 text-sm">Демо-роль<select className="rounded-xl bg-card p-3" value={manager ? 'manager' : 'agent'} onChange={e => setManager(e.target.value === 'manager')}><option value="agent">Сотрудник</option><option value="manager">Руководитель</option></select></label>
      <nav aria-label="Разделы достижений" className="flex gap-1 rounded-xl bg-muted p-1">{['Задания', 'Награды', 'История'].map(t => <button key={t} aria-pressed={tab === t} onClick={() => setTab(t)} className={`min-h-11 flex-1 rounded-lg text-sm ${tab === t ? 'bg-card font-semibold shadow-sm' : 'text-muted-foreground'}`}>{t}</button>)}</nav>
      {tab === 'Задания' && <div className="space-y-3"><p className="text-sm text-muted-foreground">В демо выполнение моделируется кнопкой. В рабочей версии основание — событие CRM и проверка результата.</p>{manager && <label className="block text-sm">Причина отклонения<input className="mt-2 w-full rounded-xl bg-card p-3" maxLength={300} value={reason} onChange={e => setReason(e.target.value)} placeholder="Что нужно исправить?" /></label>}{missions.map((m, i) => <article key={m.title} className="space-y-3 rounded-2xl bg-card p-4"><div className="flex items-start gap-3"><GraduationCap aria-hidden="true" className="mt-1 size-5 shrink-0 text-primary"/><div className="flex-1"><h2 className="font-semibold">{m.title}</h2><p className="mt-1 text-sm text-muted-foreground">{m.detail}</p></div><span className="whitespace-nowrap text-sm font-semibold">+{m.coins}</span></div><p className="text-xs text-muted-foreground">Один раз за демо · подтверждает руководитель</p>{state.tasks[i] === 'open' ? <button disabled={manager} className={button} onClick={() => dispatch({ type: 'submit', index: i })}>Симулировать выполнение</button> : <p role="status" className="text-sm font-medium">{{ pending: 'Ожидает проверки', approved: 'Подтверждено · coins начислены', rejected: 'Отклонено · причина в истории' }[state.tasks[i] as 'pending' | 'approved' | 'rejected']}</p>}{manager && state.tasks[i] === 'pending' && <div className="flex flex-wrap gap-2"><button className={button} onClick={() => dispatch({ type: 'approve', index: i })}>Подтвердить</button><button className="rounded-xl border px-4 py-3 text-sm disabled:opacity-40" disabled={!reason.trim()} onClick={() => dispatch({ type: 'reject', index: i, reason })}>Отклонить</button></div>}</article>)}</div>}
      {tab === 'Награды' && <div className="space-y-3"><p className="text-sm text-muted-foreground">Демо-каталог агентства · выдача условно до 3 рабочих дней. Coins резервируются до выдачи, при отмене возвращаются.</p>{prizes.map((p, i) => <article key={p.title} className="rounded-2xl bg-card p-4"><Gift aria-hidden="true" className="mb-3 size-6 text-primary"/><h2 className="font-semibold">{p.title}</h2><p className="my-2 text-sm">{p.price} coins</p><button disabled={manager || state.balance < p.price} className={button} onClick={() => dispatch({ type: 'redeem', index: i })}>{state.balance < p.price ? `Не хватает ${p.price - state.balance} coins` : 'Обменять — зарезервировать'}</button></article>)}<h2 className="pt-3 font-semibold">Мои обмены</h2>{!state.orders.length && <p className="text-sm text-muted-foreground">Здесь появятся выбранные награды.</p>}{state.orders.map((o, i) => <article key={i} className="space-y-3 rounded-2xl bg-card p-4"><h3 className="font-medium">{prizes[o.prize].title}</h3><p className="text-sm">{{ reserved: 'Ожидает выдачи', delivered: 'Выдано', cancelled: 'Отменено · coins возвращены' }[o.status]}</p>{o.status === 'reserved' && <div className="flex flex-wrap gap-2">{manager && <button className={button} onClick={() => dispatch({ type: 'deliver', index: i })}>Подтвердить выдачу</button>}<button className="rounded-xl border px-4 py-3 text-sm" onClick={() => dispatch({ type: 'cancel', index: i })}>Отменить обмен</button></div>}</article>)}</div>}
      {tab === 'История' && <section className="rounded-2xl bg-card p-4"><h2 className="mb-3 font-semibold">Журнал операций</h2>{!state.history.length ? <p className="text-sm text-muted-foreground">Начните с первого задания.</p> : <ol className="space-y-4">{state.history.map((entry, i) => <li key={state.history.length - i} className="flex gap-2 text-sm"><CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary"/>{entry}</li>)}</ol>}</section>}
      <button className="min-h-11 text-sm text-muted-foreground underline" onClick={() => setReset(true)}>Сбросить демо</button>{reset && <div className="space-y-3 rounded-xl border p-4"><p className="text-sm">Удалить задания, баланс и историю этого демо?</p><div className="flex gap-3"><button className={button} onClick={() => { dispatch({ type: 'reset' }); setReset(false) }}>Да, сбросить</button><button onClick={() => setReset(false)}>Оставить</button></div></div>}
    </div>
  </Screen>
}
