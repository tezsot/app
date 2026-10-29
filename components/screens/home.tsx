'use client'

import { clientNext } from '@/lib/client-next'
import { useState } from 'react'
import { HomeWorkflowLinks } from '@/components/home-workflow-links'

import {
  Building2,
  CalendarClock,
  CalendarPlus,
  Circle,
  CircleCheck,
  GraduationCap,
  ListPlus,
  Phone,
  Plus,
  RefreshCw,
  ShieldCheck,
  TriangleAlert,
  UserPlus,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { Avatar, Badge, Button, GlassButton, Group, IconTile, Progress, Row, Screen, type Tone } from '@/components/ios/primitives'
import { SHOWING_LABEL, money, propertyTitle } from '@/lib/data'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

interface Attention {
  id: string
  icon: LucideIcon
  tone: Tone
  title: string
  reason: string
  action: string
  onAction: () => void
  onOpen: () => void
}

export function HomeScreen() {
  const s = useStore()
  const [showAll, setShowAll] = useState(false)
  const client = (id?: string) => s.clients.find((c) => c.id === id)
  const property = (id?: string) => s.properties.find((p) => p.id === id)

  const attention: Attention[] = []
  s.tasks
    .filter((t) => !t.done && (t.bucket === 'overdue' || (t.kind === 'call' && t.reason?.includes('Пропущ'))))
    .forEach((t) => {
      const c = client(t.clientId)
      attention.push({
        id: t.id,
        icon: t.bucket === 'overdue' ? TriangleAlert : Phone,
        tone: t.bucket === 'overdue' ? 'danger' : 'warning',
        title: c ? `${t.title}: ${c.name.split(' ')[0]}` : t.title,
        reason: t.reason ?? t.time,
        action: t.kind === 'call' && c ? 'Позвонить' : 'Открыть',
        onAction: () => t.kind === 'call' && c ? s.openSheet({ type: 'call', clientId: c.id, taskId: t.id }) : s.push({ name: 'tasks' }),
        onOpen: () => c ? s.push({ name: 'client', id: c.id }) : s.push({ name: 'tasks' }),
      })
    })
  s.showings
    .filter((sh) => sh.status === 'pending')
    .forEach((sh) => {
      const c = client(sh.clientId)
      attention.push({
        id: sh.id,
        icon: CalendarClock,
        tone: 'warning',
        title: `Показ ${sh.day === 0 ? 'сегодня' : 'завтра'} в ${sh.time} не подтверждён`,
        reason: `${c?.name} · ${propertyTitle(property(sh.propertyId)!)}`,
        action: 'Подтвердить',
        onAction: () => {
          s.updateShowing(sh.id, { status: 'confirmed' })
          s.notify('Показ подтверждён', () => s.updateShowing(sh.id, { status: 'pending' }))
        },
        onOpen: () => s.push({ name: 'showings' }),
      })
    })
  s.deals
    .filter((d) => d.commission.status === 'partial')
    .forEach((d) => {
      attention.push({
        id: d.id,
        icon: Wallet,
        tone: 'neutral',
        title: `Остаток комиссии ${money(d.commission.amount - d.commission.received)}`,
        reason: `${client(d.clientId)?.name} · до ${d.commission.due}`,
        action: 'Открыть',
        onAction: () => s.push({ name: 'deal', id: d.id }),
        onOpen: () => s.push({ name: 'deal', id: d.id }),
      })
    })

  s.clients.filter(c => c.status !== 'closed' && !clientNext(c.id, s.tasks, s.showings, s.now)).forEach(c => {
    attention.push({
      id: `next-${c.id}`, icon: CalendarClock, tone: 'warning',
      title: `${c.name}: нет следующего шага`, reason: 'Назначьте контакт, чтобы не потерять клиента', action: 'Назначить',
      onAction: () => s.openSheet({ type: 'addTask', clientId: c.id }),
      onOpen: () => s.push({ name: 'client', id: c.id }),
    })
  })

  const today = [
    ...s.tasks
      .filter((t) => t.bucket === 'today')
      .map((t) => ({ kind: 'task' as const, time: t.time, task: t })),
    ...s.showings
      .filter((sh) => sh.day === 0)
      .map((sh) => ({ kind: 'showing' as const, time: sh.time, showing: sh })),
  ].sort((a, b) => Date.parse(a.kind === 'task' ? a.task.dueAt : a.showing.startsAt) - Date.parse(b.kind === 'task' ? b.task.dueAt : b.showing.startsAt))

  const priority = { danger: 0, warning: 1, neutral: 2 } as Record<string, number>
  attention.sort((a, b) => (priority[a.tone] ?? 3) - (priority[b.tone] ?? 3))
  const next = today.find(item => item.kind === 'task'
    ? !item.task.done && Date.parse(item.task.dueAt) >= s.now.getTime()
    : ['scheduled', 'pending', 'confirmed'].includes(item.showing.status) && Date.parse(item.showing.startsAt) >= s.now.getTime())
  const missingOutcomes = s.showings.filter(sh => sh.status === 'done' && !sh.outcome?.trim())

  const recheck = s.properties.filter((p) => p.freshness === 'recheck').length
  const legalDone = s.legal.filter((l) => l.done).length
  const recent = s.clients.flatMap((c) => c.history.slice(0, 1).map((h) => ({ ...h, client: c }))).slice(0, 3)

  return (
    <Screen
      title="Сегодня"
      subtitle={new Intl.DateTimeFormat('ru-RU', { timeZone: 'Asia/Tashkent', weekday: 'long', day: 'numeric', month: 'long' }).format(s.now)}
      actions={
        <>
          <GlassButton icon={Plus} label="Добавить" onClick={() => s.openSheet({ type: 'add' })} />
          <button
            type="button"
            aria-label="Профиль и настройки"
            onClick={() => s.push({ name: 'settings' })}
            className="press rounded-full"
          >
            <Avatar name="Камрон Тошев" size={44} />
          </button>
        </>
      }
    >
      <p className="px-8 pb-4 text-[13px] text-muted-foreground">Демо · изменения сбрасываются при перезагрузке. Звонки и уведомления не отправляются.</p>
      <Group header="Ближайшее действие · Ташкент">
        {next ? <Row icon={CalendarClock} tone="dark" title={next.kind === 'task' ? next.task.title : 'Показ'} value={next.time}
          subtitle={next.kind === 'task' ? client(next.task.clientId)?.name ?? 'Рабочая задача' : `${client(next.showing.clientId)?.name ?? 'Клиент'} · ${next.showing.place}`}
          onClick={() => next.kind === 'task' ? (next.task.kind === 'call' && next.task.clientId ? s.openSheet({ type: 'call', clientId: next.task.clientId, taskId: next.task.id }) : s.push({ name: 'tasks' })) : s.push({ name: 'showings' })} />
          : <Row icon={CalendarPlus} title="На сегодня больше ничего не назначено" subtitle="Просроченные дела — в очереди ниже" onClick={() => s.openSheet({ type: 'addTask' })} />}
      </Group>
      <section className="px-4 pb-6" aria-labelledby="attention-h">
        <div className="flex items-end justify-between px-4 pb-2">
          <h2 id="attention-h" className="label-section">
            Требует внимания
          </h2>
          {attention.length > 0 && (
            <span className="text-[13px] text-muted-foreground tabular-nums">{attention.length}</span>
          )}
        </div>
        {attention.length === 0 ? (
          <div className="flex items-center gap-3 rounded-[22px] bg-card px-4 py-4">
            <IconTile icon={CircleCheck} tone="success" />
            <div>
              <p className="text-[16px] font-medium">Срочного нет</p>
              <p className="text-[13px] text-muted-foreground">Все обещанные контакты выполнены</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {(showAll ? attention : attention.slice(0, 4)).map((a, i) => (
              <div
                key={a.id}
                className="anim-rise flex items-center gap-3 rounded-[22px] bg-card py-3 pr-3 pl-4"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <button type="button" onClick={a.onOpen} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                  <IconTile icon={a.icon} tone={a.tone} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] leading-snug font-semibold text-pretty">{a.title}</span>
                    <span className="mt-0.5 block truncate text-[13px] text-muted-foreground">{a.reason}</span>
                  </span>
                </button>
                <Button size="sm" variant={i === 0 ? 'primary' : 'secondary'} onClick={a.onAction}>
                  {a.action}
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      {attention.length > 4 && <div className="px-8 pb-6"><button className="min-h-11 text-sm font-medium underline" aria-expanded={showAll} onClick={() => setShowAll(!showAll)}>{showAll ? 'Свернуть' : `Показать остальные (${attention.length - 4})`}</button></div>}
      {missingOutcomes.length > 0 && <Group header="После показа"><Row icon={CalendarClock} tone="warning" title={`${missingOutcomes.length} показа без результата`} subtitle="Запишите обратную связь и следующий шаг" onClick={() => s.push({ name: 'showings' })} /></Group>}
      <section aria-label="Быстрые действия" className="grid grid-cols-4 gap-2 px-4 pb-7">
        {[
          { icon: UserPlus, label: 'Клиент', on: () => s.openSheet({ type: 'addClient' }) },
          { icon: Building2, label: 'Объект', on: () => s.openSheet({ type: 'addProperty' }) },
          { icon: CalendarPlus, label: 'Показ', on: () => s.openSheet({ type: 'addShowing' }) },
          { icon: ListPlus, label: 'Задача', on: () => s.openSheet({ type: 'addTask' }) },
        ].map((q) => (
          <button
            key={q.label}
            type="button"
            onClick={q.on}
            className="press flex flex-col items-center gap-2 rounded-[20px] bg-card py-3.5"
          >
            <q.icon className="size-[22px]" strokeWidth={1.9} aria-hidden />
            <span className="text-[13px] font-medium">{q.label}</span>
          </button>
        ))}
      </section>

      <Group
        header="План на день"
        action={
          <button type="button" onClick={() => s.push({ name: 'tasks' })} className="text-[15px] font-medium">
            Все задачи
          </button>
        }
      >
        {today.map((item) =>
          item.kind === 'task' ? (
            <div key={item.task.id} className="group/row flex min-h-[56px] items-center gap-3 pl-4">
              <button
                type="button"
                aria-label={item.task.done ? 'Выполнено' : `Выполнить: ${item.task.title}`}
                onClick={() => !item.task.done && s.completeTask(item.task.id)}
                className="-m-2 flex size-11 shrink-0 items-center justify-center"
              >
                {item.task.done ? (
                  <CircleCheck className="anim-pop size-[26px] fill-primary text-primary-foreground" strokeWidth={2} />
                ) : (
                  <Circle className="size-[26px] text-muted-foreground/50" strokeWidth={1.75} />
                )}
              </button>
              <button
                type="button"
                onClick={() =>
                  item.task.clientId
                    ? s.push({ name: 'client', id: item.task.clientId })
                    : item.task.propertyId && s.push({ name: 'property', id: item.task.propertyId })
                }
                className="flex min-w-0 flex-1 items-center gap-3 self-stretch border-b border-separator py-2.5 pr-4 text-left group-last/row:border-b-0"
              >
                <span className="min-w-0 flex-1">
                  <span className={cn('block truncate text-[16px]', item.task.done && 'text-muted-foreground line-through')}>
                    {item.task.title}
                  </span>
                  <span className="block truncate text-[13px] text-muted-foreground">
                    {client(item.task.clientId)?.name ??
                      (item.task.propertyId ? propertyTitle(property(item.task.propertyId)!) : '')}
                  </span>
                </span>
                <span className="text-[15px] text-muted-foreground tabular-nums">{item.time}</span>
              </button>
            </div>
          ) : (
            <Row
              key={item.showing.id}
              icon={CalendarClock}
              tone={item.showing.status === 'done' ? 'neutral' : 'dark'}
              title={`Показ · ${client(item.showing.clientId)?.name.split(' ')[0]}`}
              subtitle={
                <span className="flex items-center gap-1.5">
                  <Badge
                    kind={
                      item.showing.status === 'confirmed' ? 'success' : item.showing.status === 'pending' ? 'warning' : 'neutral'
                    }
                  >
                    {SHOWING_LABEL[item.showing.status]}
                  </Badge>
                  <span className="truncate">{propertyTitle(property(item.showing.propertyId)!)}</span>
                </span>
              }
              value={item.time}
              onClick={() => s.push({ name: 'showings' })}
              chevron={false}
            />
          ),
        )}
      </Group>

      {recheck > 0 && (
        <Group>
          <Row
            icon={RefreshCw}
            tone="warning"
            title={`${recheck} объекта ждут проверки`}
            subtitle="Подтвердите цену и статус у собственника"
            onClick={() => s.setTab('properties')}
          />
        </Group>
      )}

      <HomeWorkflowLinks />
      <Group header="Легализация">
        <button
          type="button"
          onClick={() => s.push({ name: 'legal' })}
          className="flex w-full items-center gap-3 px-4 py-4 text-left active:bg-accent"
        >
          <IconTile icon={GraduationCap} tone="dark" />
          <span className="min-w-0 flex-1">
            <span className="flex items-baseline justify-between">
              <span className="text-[16px] font-medium">Ваш маршрут</span>
              <span className="text-[13px] text-muted-foreground tabular-nums">
                {legalDone} из {s.legal.length}
              </span>
            </span>
            <Progress value={(legalDone / s.legal.length) * 100} className="mt-2" />
            <span className="mt-2 block text-[13px] text-muted-foreground">
              Далее: {s.legal.find((l) => !l.done)?.title}
            </span>
          </span>
        </button>
      </Group>

      <Group header="Последняя активность">
        {recent.map((r) => (
          <Row
            key={r.id}
            leading={<Avatar name={r.client.name} size={30} />}
            title={r.label}
            subtitle={`${r.client.name} · ${r.when}`}
            onClick={() => s.push({ name: 'client', id: r.client.id })}
          />
        ))}
      </Group>

      <p className="flex items-center justify-center gap-1.5 px-8 text-center text-[12px] text-muted-foreground">
        <ShieldCheck className="size-3.5" aria-hidden />
        Демонстрационные данные · командные права здесь не применяются
      </p>
    </Screen>
  )
}
