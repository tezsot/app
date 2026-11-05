'use client'

import { useState } from 'react'
import { CalendarClock, CircleCheck, Phone } from 'lucide-react'
import { useStore } from '@/lib/store'
import { clockLabel, dayLabel, dayOffset } from '@/lib/dates'
import { SHOWING_LABEL } from '@/lib/data'
import { Button, Chip, ChipScroller, Group, Row } from '@/components/ios/primitives'

export function DailyAgenda() {
  const s = useStore()
  const [view, setView] = useState('today')
  const entries = [
    ...s.tasks.filter(t => !t.done).map(t => ({ id: t.id, at: t.dueAt, title: t.title, task: t, showing: undefined })),
    ...s.showings.filter(sh => !['done', 'cancelled'].includes(sh.status)).map(sh => ({ id: sh.id, at: sh.startsAt, title: 'Показ', task: undefined, showing: sh })),
  ].sort((a, b) => Date.parse(a.at) - Date.parse(b.at))
  const matches = (at: string, key: string) => key === 'overdue' ? Date.parse(at) < s.now.getTime() : dayOffset(at, s.now) === (key === 'today' ? 0 : 1)
  const visible = entries.filter(e => matches(e.at, view))
  return <section aria-label="Рабочая очередь" className="pb-5">
    <div className="flex items-center justify-between px-8 pb-3"><h2 className="label-section">Рабочая очередь</h2><button type="button" className="min-h-11 text-sm font-medium text-primary" onClick={() => s.openSheet({ type: 'addTask' })}>Добавить</button></div>
    <ChipScroller>{[{ key: 'overdue', label: 'Просрочено' }, { key: 'today', label: 'Сегодня' }, { key: 'tomorrow', label: 'Завтра' }].map(v => <Chip key={v.key} active={view === v.key} onClick={() => setView(v.key)} count={entries.filter(e => matches(e.at, v.key)).length}>{v.label}</Chip>)}</ChipScroller>
    <p className="px-8 pb-3 text-xs text-muted-foreground">Незавершённые задачи и показы · время Ташкента{view === 'today' ? ' · включая просроченные сегодня' : ''}</p>
    <div className="flex flex-col gap-3 px-4">
      {!visible.length && <div className="flex flex-col gap-2 rounded-[22px] bg-card p-5"><CircleCheck className="size-6 text-muted-foreground" aria-hidden /><p className="font-medium">{view === 'overdue' ? 'Просроченных дел нет' : 'План свободен'}</p><p className="text-sm text-muted-foreground">{view === 'overdue' ? 'Можно перейти к сегодняшним делам.' : 'Добавьте задачу или назначьте показ.'}</p><Button variant="secondary" onClick={() => view === 'overdue' ? setView('today') : s.openSheet({ type: 'addShowing' })}>{view === 'overdue' ? 'План на сегодня' : 'Назначить показ'}</Button></div>}
      {visible.map(e => {
        const clientId = e.task?.clientId ?? e.showing?.clientId
        const propertyId = e.task?.propertyId ?? e.showing?.propertyId
        const client = s.clients.find(c => c.id === clientId)
        const property = s.properties.find(p => p.id === propertyId)
        const late = Date.parse(e.at) < s.now.getTime()
        return <article key={`${e.task ? 'task' : 'showing'}-${e.id}`} className="flex flex-col gap-3 rounded-[22px] border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-3 text-xs"><span className={late ? 'font-medium text-destructive' : 'text-muted-foreground'}>{dayLabel(e.at, s.now)} · {clockLabel(e.at)}{late ? ' · просрочено' : ''}</span><span className="text-muted-foreground">{e.showing ? SHOWING_LABEL[e.showing.status] : 'Задача'}</span></div>
          <div><h3 className="font-semibold">{e.title}</h3>{client && <button type="button" onClick={() => s.push({ name: 'client', id: client.id })} className="block min-h-11 text-left text-sm text-primary">{client.name}</button>}{property && <button type="button" onClick={() => s.push({ name: 'property', id: property.id })} className="block min-h-11 text-left text-xs text-muted-foreground">{property.district} · {property.address}</button>}</div>
          <div className="flex flex-wrap gap-2">{e.task ? <>{e.task.kind === 'call' && client && <Button size="sm" onClick={() => s.openSheet({ type: 'call', clientId: client.id, taskId: e.id })}><Phone className="size-4" />Позвонить</Button>}<Button size="sm" variant="secondary" onClick={() => s.completeTask(e.id)}>Выполнено</Button></> : <>{late && <Button size="sm" onClick={() => s.openSheet({ type: 'outcome', showingId: e.id })}>Записать итог</Button>}<Button size="sm" variant="secondary" onClick={() => s.push({ name: 'showings' })}><CalendarClock className="size-4" />Открыть показы</Button></>}</div>
        </article>
      })}
    </div>
    <div className="flex gap-4 px-8 pt-3"><button type="button" className="min-h-11 text-sm text-primary" onClick={() => s.push({ name: 'tasks' })}>Все задачи</button><button type="button" className="min-h-11 text-sm text-primary" onClick={() => s.push({ name: 'showings' })}>Все показы</button></div>
  </section>
}

export function PropertyRecheckQueue() {
  const s = useStore()
  const properties = s.properties.filter(p => !p.draft && p.freshness === 'recheck')
  const [all, setAll] = useState(false)
  if (!properties.length) return null
  return <Group header={`Актуализировать объекты · ${properties.length}`} footer="Откройте карточку и уточните цену и доступность у собственника. Статус не меняется автоматически.">{(all ? properties : properties.slice(0, 3)).map(p => <Row key={p.id} title={p.address} subtitle={`${p.district} · ${p.owner}`} onClick={() => s.push({ name: 'property', id: p.id })} />)}{properties.length > 3 && <button type="button" className="min-h-11 px-4 text-sm text-primary" aria-expanded={all} onClick={() => setAll(!all)}>{all ? 'Свернуть' : `Ещё ${properties.length - 3}`}</button>}</Group>
}
