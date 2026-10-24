'use client'

import {
  CalendarPlus,
  CircleAlert,
  Clock,
  Handshake,
  ListPlus,
  MessageCircle,
  Phone,
  Plus,
  StickyNote,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import {
  Avatar,
  Badge,
  Button,
  Chip,
  ChipScroller,
  Empty,
  GlassButton,
  Group,
  Row,
  Screen,
  SearchField,
} from '@/components/ios/primitives'
import {
  type Client,
  DEAL_STAGES,
  SHOWING_LABEL,
  STATUS_LABEL,
  compactMoney,
  matchReasons,
  matchScore,
  money,
  propertyTitle,
} from '@/lib/data'
import { useStore } from '@/lib/store'
import { clientNext } from '@/lib/client-next'
import { cn } from '@/lib/utils'

type View = 'all' | 'contact' | 'active' | 'nonext' | 'closed'

export function budgetLabel(c: Client) {
  if (!c.budgetMax) return 'Бюджет не указан'
  const suffix = c.intent === 'rent' ? '/мес' : ''
  return `${compactMoney(c.budgetMin ?? 0)}–${compactMoney(c.budgetMax)}${suffix}`
}

export function ClientsScreen() {
  const s = useStore()
  const [view, setView] = useState<View>('all')
  const [q, setQ] = useState('')

  const nextFor = (id: string) => clientNext(id, s.tasks, s.showings, s.now)
  const needsContact = (c: Client) => c.status !== 'closed' && (c.status === 'contact' || c.status === 'new' || nextFor(c.id)?.bucket === 'overdue')
  const priority = (c: Client) => {
    const t = nextFor(c.id)
    if (c.status === 'closed') return 9
    if (t?.bucket === 'overdue') return 0
    if (c.status === 'contact' || c.status === 'new') return 1
    if (!t) return 2
    return t.bucket === 'today' ? 3 : 4
  }

  const filtered = s.clients
    .filter((c) => {
      if (view === 'contact') return needsContact(c)
      if (view === 'active') return c.status === 'active'
      if (view === 'nonext') return c.status !== 'closed' && !nextFor(c.id)
      if (view === 'closed') return c.status === 'closed'
      return true
    })
    .filter((c) => !q || `${c.name} ${c.phone} ${c.district}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => priority(a) - priority(b))

  const counts = {
    contact: s.clients.filter(needsContact).length,
    nonext: s.clients.filter((c) => c.status !== 'closed' && !nextFor(c.id)).length,
  }

  return (
    <Screen
      title="Клиенты"
      actions={<GlassButton icon={Plus} label="Новый клиент" onClick={() => s.openSheet({ type: 'addClient' })} />}
    >
      <div className="px-4 pb-3">
        <SearchField value={q} onChange={setQ} placeholder="Имя, телефон, район" />
      </div>
      <ChipScroller>
        <Chip active={view === 'all'} onClick={() => setView('all')}>
          Все
        </Chip>
        <Chip active={view === 'contact'} onClick={() => setView('contact')} count={counts.contact}>
          Нужно связаться
        </Chip>
        <Chip active={view === 'active'} onClick={() => setView('active')}>
          Активные
        </Chip>
        <Chip active={view === 'nonext'} onClick={() => setView('nonext')} count={counts.nonext}>
          Без следующего шага
        </Chip>
        <Chip active={view === 'closed'} onClick={() => setView('closed')}>
          Закрытые
        </Chip>
      </ChipScroller>

      {filtered.length === 0 ? (
        <Empty
          icon={Users}
          title={q ? 'Ничего не найдено' : 'Здесь пусто'}
          text={q ? 'Попробуйте имя, часть телефона или район' : 'Добавьте первого клиента — достаточно имени и телефона'}
          action={
            !q && (
              <Button icon={Plus} onClick={() => s.openSheet({ type: 'addClient' })}>
                Добавить клиента
              </Button>
            )
          }
        />
      ) : (
        <Group footer="Сортировка: сначала те, с кем нужно связаться">
          {filtered.map((c) => {
            const t = nextFor(c.id)
            return (
              <Row
                key={c.id}
                leading={<Avatar name={c.name} size={42} />}
                onClick={() => s.push({ name: 'client', id: c.id })}
                title={<span className="font-medium">{c.name}</span>}
                subtitle={
                  <>
                    <span className="block truncate">
                      {c.intent === 'buy' ? 'Покупка' : 'Аренда'} · {c.kind}
                      {c.rooms ? `, ${c.rooms}к` : ''} · <span className="tabular-nums">{budgetLabel(c)}</span>
                    </span>
                    <span
                      className={cn(
                        'mt-1 flex items-center gap-1 text-[13px]',
                        t?.bucket === 'overdue' ? 'font-medium text-destructive' : !t && c.status !== 'closed' ? 'text-warning-ink' : '',
                      )}
                    >
                      {t ? (
                        <>
                          <Clock className="size-3.5" aria-hidden />
                          <span className="truncate">
                            {t.title} · {t.time}
                          </span>
                        </>
                      ) : c.status === 'closed' ? (
                        'Закрыт'
                      ) : (
                        <>
                          <CircleAlert className="size-3.5" aria-hidden />
                          Нет следующего шага
                        </>
                      )}
                    </span>
                  </>
                }
              />
            )
          })}
        </Group>
      )}
    </Screen>
  )
}

export function ClientDetail({ id }: { id: string }) {
  const s = useStore()
  const c = s.clients.find((x) => x.id === id)
  if (!c) return null
  const next = clientNext(c.id, s.tasks, s.showings, s.now)
  const matches = s.properties
    .map((p) => ({ p, score: matchScore(c, p) }))
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score)
  const showings = s.showings.filter((sh) => sh.clientId === c.id)
  const deals = s.deals.filter((d) => d.clientId === c.id)

  const actions = [
    { icon: Phone, label: 'Позвонить', on: () => s.openSheet({ type: 'call', clientId: c.id, taskId: next?.id }) },
    {
      icon: MessageCircle,
      label: 'Написать',
      on: () => {
        s.addHistory(c.id, 'Сообщение в Telegram')
        s.notify('Открыт чат в Telegram')
      },
    },
    { icon: CalendarPlus, label: 'Показ', on: () => s.openSheet({ type: 'addShowing', clientId: c.id }) },
    { icon: ListPlus, label: 'Задача', on: () => s.openSheet({ type: 'addTask', clientId: c.id }) },
  ]

  return (
    <Screen title={c.name} back onBack={s.pop} largeTitle={false}>
      <div className="flex flex-col items-center px-5 pb-5 text-center">
        <Avatar name={c.name} size={84} />
        <h1 className="mt-3 text-[26px] leading-tight font-bold">{c.name}</h1>
        <p className="mt-0.5 text-[15px] text-muted-foreground tabular-nums">{c.phone}</p>
        <div className="mt-2 flex gap-1.5">
          <Badge kind={c.status === 'contact' ? 'warning' : c.status === 'closed' ? 'neutral' : 'outline'}>
            {STATUS_LABEL[c.status]}
          </Badge>
          <Badge kind="neutral">{c.source}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 px-4 pb-5">
        {actions.map((a) => (
          <button
            key={a.label}
            type="button"
            onClick={a.on}
            className="press flex flex-col items-center gap-1.5 rounded-[18px] bg-card py-3"
          >
            <a.icon className="size-5" strokeWidth={2} aria-hidden />
            <span className="text-[12px] font-medium">{a.label}</span>
          </button>
        ))}
      </div>

      <section className="px-4 pb-6" aria-label="Следующий шаг">
        {next ? (
          <div
            className={cn(
              'rounded-[22px] p-4',
              next.bucket === 'overdue' ? 'bg-destructive/[0.07] ring-1 ring-destructive/20' : 'bg-card',
            )}
          >
            <p className={cn('label-section', next.bucket === 'overdue' && 'text-destructive')}>
              {next.bucket === 'overdue' ? 'Просрочено' : 'Следующий шаг'}
            </p>
            <p className="mt-1 text-[17px] font-semibold">{next.title}</p>
            <p className="text-[14px] text-muted-foreground">{next.time}</p>
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                icon={Phone}
                onClick={() => next.source === 'showing' ? s.push({ name: 'showings' }) : next.kind === 'call' ? s.openSheet({ type: 'call', clientId: c.id, taskId: next.id }) : s.push({ name: 'tasks', taskId: next.id })}
              >
                {next.source === 'showing' ? 'К показам' : next.kind === 'call' ? 'Позвонить' : 'Открыть задачу'}
              </Button>
              {next.source === 'task' && <Button size="sm" variant="secondary" onClick={() => s.completeTask(next.id)}>
                Выполнено
              </Button>}
            </div>
          </div>
        ) : (
          c.status !== 'closed' && (
            <div className="flex items-center gap-3 rounded-[22px] bg-warning/12 p-4">
              <CircleAlert className="size-5 shrink-0 text-warning-ink" aria-hidden />
              <p className="flex-1 text-[15px] font-medium">Нет следующего шага</p>
              <Button size="sm" onClick={() => s.openSheet({ type: 'addTask', clientId: c.id })}>
                Назначить
              </Button>
            </div>
          )
        )}
      </section>

      <div className="px-4 pb-4"><Button onClick={() => s.openSheet({ type: 'addClient', clientId: c.id })}>Редактировать клиента и запрос</Button></div>
      <Group header="Запрос">
        <Row title="Цель" value={`${c.intent === 'buy' ? 'Покупка' : 'Аренда'} · ${c.kind}`} />
        <Row title="Бюджет" value={budgetLabel(c)} />
        {c.district && <Row title="Район" value={c.district} />}
        {c.rooms && <Row title="Комнат" value={c.rooms} />}
        {c.note && <Row title="Пожелания" subtitle={c.note} />}
      </Group>

      <Group
        header={`Подходящие объекты · ${matches.length}`}
        footer={matches.length > 0 ? 'Совпадение по типу, бюджету, району и комнатам' : undefined}
      >
        {matches.length === 0 ? (
          <Row title="Пока нет совпадений" subtitle="Добавьте объект или уточните запрос" />
        ) : (
          matches.map(({ p, score }) => (
            <div key={p.id} className="group/row flex items-center gap-3 pl-4">
              <button
                type="button"
                onClick={() => s.push({ name: 'property', id: p.id })}
                className="flex min-w-0 flex-1 items-center gap-3 py-3 text-left"
              >
                {p.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image} alt="" className="size-14 shrink-0 rounded-[12px] object-cover" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block text-[16px] font-semibold tabular-nums">{money(p.price, p.op)}</span>
                  <span className="block truncate text-[13px] text-muted-foreground">
                    {propertyTitle(p)} · {p.district}
                  </span>
                  <span className="mt-1 flex gap-1">
                    <Badge kind="success">{score}%</Badge>
                    {matchReasons(c, p).map((r) => (
                      <Badge key={r} kind="neutral">
                        {r}
                      </Badge>
                    ))}
                  </span>
                </span>
              </button>
              <div className="pr-3">
                <Button
                  size="sm"
                  variant="secondary"
                  aria-label={`Назначить показ: ${propertyTitle(p)}`}
                  onClick={() => s.openSheet({ type: 'addShowing', clientId: c.id, propertyId: p.id })}
                >
                  Показ
                </Button>
              </div>
            </div>
          ))
        )}
      </Group>

      {(showings.length > 0 || deals.length > 0) && (
        <Group header="Показы и сделки">
          {showings.map((sh) => {
            const p = s.properties.find((x) => x.id === sh.propertyId)!
            return (
              <Row
                key={sh.id}
                icon={CalendarPlus}
                title={propertyTitle(p)}
                subtitle={`${sh.day === 0 ? 'Сегодня' : sh.day === 1 ? 'Завтра' : `Через ${sh.day} дн.`}, ${sh.time} · ${SHOWING_LABEL[sh.status]}${sh.outcome ? ` · ${sh.outcome}` : ''}`}
                onClick={() => s.push({ name: 'showings' })}
              />
            )
          })}
          {deals.map((d) => (
            <Row
              key={d.id}
              icon={Handshake}
              tone="dark"
              title={`Сделка · ${DEAL_STAGES[d.stage]}`}
              subtitle={`Комиссия ${money(d.commission.amount)}`}
              onClick={() => s.push({ name: 'deal', id: d.id })}
            />
          ))}
        </Group>
      )}

      <Group
        header="История"
        action={
          <button
            type="button"
            className="flex items-center gap-1 text-[15px] font-medium"
            onClick={() => {
              s.addHistory(c.id, 'Заметка: уточнить ипотеку')
              s.notify('Заметка добавлена')
            }}
          >
            <StickyNote className="size-4" aria-hidden />
            Заметка
          </button>
        }
      >
        <ol className="px-4 py-2">
          {c.history.map((h, i) => (
            <li key={h.id} className="relative flex gap-3 pb-3 last:pb-1">
              <span className="relative flex w-3 justify-center pt-1.5">
                <span className={cn('size-2 rounded-full', i === 0 ? 'bg-primary' : 'bg-muted-foreground/40')} />
                {i < c.history.length - 1 && <span className="absolute top-4 bottom-[-6px] w-px bg-border" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px]">{h.label}</span>
                <span className="block text-[13px] text-muted-foreground">{h.when}</span>
              </span>
            </li>
          ))}
        </ol>
      </Group>
    </Screen>
  )
}
