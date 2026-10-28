'use client'

import { useState } from 'react'

type Entry = { id: string; name: string; owner: string; next: string; when: string; contacted: boolean }
const button = 'min-h-11 rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-4'
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tashkent', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
function shift(day: string, amount: number) { const date = new Date(`${day}T12:00:00Z`); date.setUTCDate(date.getUTCDate() + amount); return date.toISOString().slice(0, 10) }
function label(day: string) { return new Intl.DateTimeFormat('ru-RU', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(`${day}T12:00:00Z`)) }
export function LeadCalendar({ entries, onOpen }: { entries: Entry[]; onOpen: (id: string) => void }) {
  const [day, setDay] = useState(today)
  const [mode, setMode] = useState<'day' | 'week'>('day')
  const weekday = new Date(`${day}T12:00:00Z`).getUTCDay()
  const start = mode === 'day' ? day : shift(day, -((weekday + 6) % 7))
  const days = Array.from({ length: mode === 'day' ? 1 : 7 }, (_, i) => shift(start, i))
  const pending = entries.filter(entry => entry.when && !entry.contacted)
  return <section aria-label="Календарь первых контактов" className="mt-8 rounded-3xl border border-neutral-200 bg-white p-5 sm:p-6">
    <h2 className="text-xl font-semibold">Первый контакт — в расписании</h2><p className="mt-2 text-sm leading-6 text-neutral-600">Время Ташкента · UTC+5. Только назначенные первые контакты; это не календарь показов. Отмеченные состоявшимися скрыты.</p>
    <div className="my-4 flex flex-wrap gap-2"><button className={button} aria-pressed={mode === 'day'} onClick={() => setMode('day')}>День</button><button className={button} aria-pressed={mode === 'week'} onClick={() => setMode('week')}>Неделя</button><button className={button} onClick={() => setDay(today())}>Сегодня</button></div>
    <div className="flex flex-wrap items-end gap-2"><button className={button} aria-label="Предыдущий период" onClick={() => setDay(shift(day, mode === 'day' ? -1 : -7))}>Назад</button><label className="grid min-w-0 gap-1 text-sm">Дата<input type="date" className={button} value={day} onChange={e => { if (/^\d{4}-\d{2}-\d{2}$/.test(e.target.value) && e.target.value >= '1900-01-01' && e.target.value <= '2100-12-31') setDay(e.target.value) }} min="1900-01-01" max="2100-12-31" /></label><button className={button} aria-label="Следующий период" onClick={() => setDay(shift(day, mode === 'day' ? 1 : 7))}>Вперёд</button></div>
    <div className="mt-5 space-y-5" aria-live="polite">{days.map(date => { const appointments = pending.filter(e => e.when.slice(0, 10) === date).sort((a, b) => a.when.localeCompare(b.when)); return <section key={date} className="border-t border-neutral-200 pt-4"><h3 className="font-medium capitalize">{label(date)}</h3>{!appointments.length ? <p className="mt-2 text-sm text-neutral-500">Первые контакты не назначены</p> : <ul className="mt-3 space-y-3">{appointments.map(entry => <li key={entry.id}><button onClick={() => onOpen(entry.id)} className={`${button} w-full text-left`}><span className="font-semibold">{entry.when.slice(11, 16)} · {entry.name}</span><span className="mt-1 block">{entry.next}</span><span className="block text-neutral-600">{entry.owner}</span>{pending.some(other => other.id !== entry.id && other.owner === entry.owner && other.when === entry.when) && <span className="block text-amber-800">У ответственного есть другой контакт на это же время</span>}</button></li>)}</ul>}</section> })}</div>
  </section>
}
