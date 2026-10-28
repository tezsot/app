'use client'

import Link from 'next/link'
import { LeadCalendar } from '@/components/lead-calendar'
import { useRef, useState } from 'react'
import { ArrowLeft, ArrowUpRight, Plus, Search } from 'lucide-react'

type Lead = { id: string; name: string; contact: string; source: string; request: string; owner: string; next: string; when: string; contacted: boolean }
const sources = ['Телефон', 'Telegram', 'Сайт', 'Рекомендация', 'Другое']
const owners = ['Вы', 'Азиза Каримова', 'Тимур Алиев']
const empty: Omit<Lead, 'id' | 'contacted'> = { name: '', contact: '', source: 'Телефон', request: '', owner: '', next: '', when: '' }
const examples: Lead[] = [
  { id: '1', name: 'Мадина', contact: 'madina@example.com', source: 'Сайт', request: 'Ищет 2 комнаты в Юнусабаде. Бюджет до $85 000.', owner: '', next: '', when: '', contacted: false },
  { id: '2', name: 'Руслан', contact: '@example_ruslan', source: 'Telegram', request: 'Хочет продать квартиру. Нужно уточнить адрес и площадь.', owner: 'Вы', next: '', when: '', contacted: false },
  { id: '3', name: 'Олег', contact: 'oleg@example.com', source: 'Рекомендация', request: 'Аренда на год, рядом с работой.', owner: 'Азиза Каримова', next: 'Уточнить район и бюджет', when: '', contacted: true },
]
const control = 'min-h-11 rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black'
const normalize = (value: string) => /^[+\d\s()-]+$/.test(value) ? value.replace(/\D/g, '') : value.trim().toLowerCase()
function status(lead: Lead) { return lead.contacted ? 'Первый контакт состоялся' : !lead.owner ? 'Без ответственного' : !lead.when ? 'Контакт не назначен' : 'Контакт запланирован' }
function time(value: string) { return new Date(`${value}+05:00`).toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) + ' · Ташкент' }

export function LeadInbox() {
  const [leads, setLeads] = useState(examples)
  const [filter, setFilter] = useState('Все')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState(empty)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const formRef = useRef<HTMLFormElement>(null)
  const duplicate = leads.find(l => l.id !== editing && normalize(l.contact) === normalize(draft.contact) && draft.contact.trim())
  const filtered = leads.filter(l => (filter === 'Все' || filter === 'Без ответственного' && !l.owner || filter === 'Нужен контакт' && !l.contacted) && `${l.name} ${l.contact} ${l.request} ${l.source}`.toLowerCase().includes(search.toLowerCase().trim()))
  function open(lead?: Lead) { setEditing(lead?.id ?? 'new'); setDraft(lead ? { ...lead } : { ...empty }); setError(''); requestAnimationFrame(() => { formRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' }); formRef.current?.querySelector('input')?.focus() }) }
  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!draft.name.trim() || !draft.request.trim() || !normalize(draft.contact)) { setError('Укажите имя, контакт и запрос — поля не могут состоять только из пробелов.'); return }
    if (duplicate) { setError('Такой контакт уже есть. Откройте существующее обращение ниже.'); return }
    if ((draft.next || draft.when) && (!draft.owner || !draft.next.trim() || !draft.when)) { setError('Для первого контакта укажите ответственного, действие и дату со временем.'); return }
    if (draft.when && (!Number.isFinite(Date.parse(`${draft.when}+05:00`)) || new Date(`${draft.when}+05:00`).getTime() <= Date.now())) { setError('Выберите будущее время первого контакта.'); return }
    const cleaned = Object.fromEntries(Object.entries(draft).map(([k,v]) => [k, typeof v === 'string' ? v.trim() : v])) as typeof draft
    const id = editing === 'new' ? crypto.randomUUID() : editing!
    setLeads(prev => editing === 'new' ? [{ ...cleaned, id, contacted: false }, ...prev] : prev.map(l => l.id === id ? { ...l, ...cleaned } : l))
    setEditing(null); setFilter('Все'); setSearch(''); setMessage('Обращение обновлено в демо. После перезагрузки изменения исчезнут.')
  }
  return <main className="min-h-dvh bg-[#faf9f6] px-5 py-6 text-neutral-950 sm:px-8"><div className="mx-auto max-w-5xl">
    <header className="flex items-center justify-between gap-4"><Link href="/start" className={`${control} inline-flex items-center gap-2`}><ArrowLeft size={16} aria-hidden />К началу</Link><span className="text-sm font-semibold">SuperApp / Обращения</span></header>
    <p className="mt-7 rounded-xl border border-neutral-300 px-4 py-3 text-xs leading-5 text-neutral-600">Демо · вымышленные контакты. Источник указывается вручную: сообщения не импортируются, звонки и уведомления не отправляются. Изменения не сохраняются после перезагрузки.</p>
    <div className="my-8 flex flex-wrap items-end justify-between gap-5"><div><p className="text-xs uppercase tracking-[0.18em] text-neutral-500">Ни одна заявка не потеряется из виду</p><h1 className="mt-3 text-4xl font-semibold tracking-tight">Входящие обращения</h1><p className="mt-3 max-w-xl text-sm leading-6 text-neutral-600">Кто обратился, откуда пришёл и кто сделает следующий шаг.</p></div><button onClick={() => open()} className={`${control} inline-flex items-center gap-2 !border-black !bg-black text-white`}><Plus size={16} aria-hidden />Зафиксировать заявку</button></div>
    <p role="status" className="text-sm leading-6">{message}</p>
    {editing && <form ref={formRef} onSubmit={save} className="my-6 scroll-mt-4 rounded-3xl border border-neutral-300 bg-white p-5 sm:p-7"><h2 className="text-xl font-semibold">{editing === 'new' ? 'Новое обращение' : 'Следующий шаг по обращению'}</h2><p className="mt-2 text-sm text-neutral-600">Можно сначала зафиксировать заявку, а ответственного и контакт назначить позже.</p><div className="mt-5 grid gap-4 sm:grid-cols-2">
      <label className="grid gap-2 text-sm">Имя *<input required maxLength={100} value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} className={control} /></label>
      <label className="grid gap-2 text-sm">Телефон, email или Telegram *<input required maxLength={150} value={draft.contact} onChange={e => setDraft({ ...draft, contact: e.target.value })} className={control} /></label>
      <label className="grid gap-2 text-sm">Источник<select value={draft.source} onChange={e => setDraft({ ...draft, source: e.target.value })} className={control}>{sources.map(s => <option key={s}>{s}</option>)}</select></label>
      <label className="grid gap-2 text-sm">Ответственный<select value={draft.owner} onChange={e => setDraft({ ...draft, owner: e.target.value })} className={control}><option value="">Пока не назначен</option>{owners.map(s => <option key={s}>{s}</option>)}</select></label>
      <label className="grid gap-2 text-sm sm:col-span-2">Что нужно клиенту *<textarea required maxLength={1000} value={draft.request} onChange={e => setDraft({ ...draft, request: e.target.value })} className={control} rows={3} /></label>
      <label className="grid gap-2 text-sm">Первое действие<input maxLength={300} placeholder="Например, уточнить бюджет" value={draft.next} onChange={e => setDraft({ ...draft, next: e.target.value })} className={control} /></label>
      <label className="grid min-w-0 gap-2 text-sm">Дата и время контакта<input type="datetime-local" value={draft.when} onChange={e => setDraft({ ...draft, when: e.target.value })} className={`${control} min-w-0 w-full`} /><span className="text-xs text-neutral-500">По Ташкенту · UTC+5</span></label>
    </div>{duplicate && <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm"><p>Возможный дубль: {duplicate.name}. Новую запись не создаём.</p><button type="button" onClick={() => open(duplicate)} className={`${control} mt-3`}>Открыть существующее обращение</button></div>}<p role="alert" className="mt-3 text-sm text-red-700">{error}</p><div className="mt-4 flex flex-wrap gap-3"><button className={`${control} !bg-black text-white`}>Применить в демо</button><button type="button" onClick={() => setEditing(null)} className={control}>Отмена</button></div></form>}
    <section aria-label="Очередь обращений" className="mt-7"><div className="flex flex-wrap gap-2">{['Все', 'Без ответственного', 'Нужен контакт'].map(f => <button key={f} aria-pressed={filter === f} onClick={() => setFilter(f)} className={`${control} ${filter === f ? '!border-black !bg-black text-white' : ''}`}>{f} · {leads.filter(l => f === 'Все' || f === 'Без ответственного' && !l.owner || f === 'Нужен контакт' && !l.contacted).length}</button>)}</div><label className="my-5 flex items-center gap-3 rounded-xl border border-neutral-300 bg-white px-4"><Search size={18} aria-hidden /><span className="sr-only">Поиск обращений</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Имя, контакт или запрос" className="min-h-12 w-full min-w-0 bg-transparent text-sm outline-offset-4" /></label>
    <div className="space-y-4">{filtered.map(lead => <article key={lead.id} className="rounded-3xl border border-neutral-200 bg-white p-5 sm:p-6"><div className="flex flex-wrap justify-between gap-3"><span className="text-xs uppercase tracking-wider text-neutral-500">{lead.source} · вручную</span><span className="rounded-full bg-neutral-100 px-3 py-1 text-xs">{status(lead)}</span></div><h2 className="mt-4 text-xl font-semibold">{lead.name}</h2><p className="mt-1 break-all text-sm text-neutral-500">{lead.contact}</p><p className="mt-4 text-sm leading-6">{lead.request}</p><div className="my-4 rounded-xl bg-[#faf9f6] p-4 text-sm leading-6"><p>Ответственный: <strong>{lead.owner || 'не назначен'}</strong></p><p>{lead.next || 'Следующий шаг пока не указан'}</p>{lead.when && <p>{time(lead.when)}</p>}</div><div className="flex flex-wrap gap-3"><button aria-label={`Изменить обращение: ${lead.name}`} onClick={() => open(lead)} className={`${control} inline-flex items-center gap-2`}>Назначить / изменить<ArrowUpRight size={16} aria-hidden /></button><button disabled={!lead.owner} onClick={() => { setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, contacted: !l.contacted } : l)); setMessage(lead.contacted ? 'Отметка контакта отменена в демо.' : 'Первый контакт отмечен в демо. Автоматического звонка не было.') }} className={`${control} disabled:opacity-40`}>{lead.contacted ? 'Отменить отметку контакта' : 'Контакт состоялся'}</button></div>{!lead.owner && <p className="mt-3 text-xs text-neutral-500">Сначала назначьте ответственного.</p>}</article>)}{!filtered.length && <div className="rounded-3xl border border-dashed border-neutral-300 p-8 text-center"><h2 className="font-medium">Обращений не найдено</h2><p className="mt-2 text-sm text-neutral-600">Попробуйте другой запрос или фильтр.</p><button onClick={() => { setSearch(''); setFilter('Все') }} className={`${control} mt-4`}>Сбросить фильтры</button></div>}</div></section>
    <LeadCalendar entries={leads} onOpen={id => { const lead = leads.find(item => item.id === id); if (lead) open(lead) }} />
    <footer className="mt-8 border-t border-neutral-200 py-6 text-sm leading-6 text-neutral-500">Демо показывает распределение заявок, а не реальные права доступа команды. Контакты здесь — вымышленные; не вводите персональные данные.</footer>
  </div></main>
}
