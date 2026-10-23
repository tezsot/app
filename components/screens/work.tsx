'use client'

import {
  CalendarCheck,
  CalendarClock,
  CalendarPlus,
  Check,
  Circle,
  CircleCheck,
  ListChecks,
  MapPin,
  Plus,
  RotateCcw,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { Badge, Button, Empty, GlassButton, Group, Screen } from '@/components/ios/primitives'
import { type Bucket, SHOWING_LABEL, propertyTitle } from '@/lib/data'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const BUCKET_LABEL: Record<Bucket, string> = { overdue: 'Просрочено', today: 'Сегодня', later: 'Позже' }

export function TasksScreen() {
  const s = useStore()
  const [showDone, setShowDone] = useState(false)
  const buckets: Bucket[] = ['overdue', 'today', 'later']
  const subject = (t: (typeof s.tasks)[number]) =>
    s.clients.find((c) => c.id === t.clientId)?.name ??
    (t.propertyId ? propertyTitle(s.properties.find((p) => p.id === t.propertyId)!) : 'Без привязки')

  return (
    <Screen
      title="Задачи"
      back
      onBack={s.pop}
      actions={
        <>
          <Button size="sm" variant="ghost" className="glass h-11" onClick={() => setShowDone((v) => !v)}>
            {showDone ? 'Скрыть готовые' : 'Готовые'}
          </Button>
          <GlassButton icon={Plus} label="Новая задача" onClick={() => s.openSheet({ type: 'addTask' })} />
        </>
      }
    >
      {buckets.map((b) => {
        const list = s.tasks.filter((t) => t.bucket === b && (showDone || !t.done))
        if (!list.length) return null
        return (
          <Group key={b} header={BUCKET_LABEL[b]}>
            {list.map((t) => (
              <div key={t.id} className="group/row flex min-h-[60px] items-center gap-3 pl-4">
                <button
                  type="button"
                  aria-label={t.done ? 'Выполнено' : `Выполнить: ${t.title}`}
                  onClick={() => !t.done && s.completeTask(t.id)}
                  className="-m-2 flex size-11 shrink-0 items-center justify-center"
                >
                  {t.done ? (
                    <CircleCheck className="anim-pop size-[26px] fill-primary text-primary-foreground" strokeWidth={2} />
                  ) : (
                    <Circle
                      className={cn('size-[26px]', b === 'overdue' ? 'text-destructive' : 'text-muted-foreground/50')}
                      strokeWidth={1.75}
                    />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    t.clientId
                      ? s.push({ name: 'client', id: t.clientId })
                      : t.propertyId && s.push({ name: 'property', id: t.propertyId })
                  }
                  className="flex min-w-0 flex-1 items-center gap-3 self-stretch border-b border-separator py-2.5 pr-4 text-left group-last/row:border-b-0"
                >
                  <span className="min-w-0 flex-1">
                    <span className={cn('block text-[16px]', t.done && 'text-muted-foreground line-through')}>{t.title}</span>
                    <span className="block truncate text-[13px] text-muted-foreground">{subject(t)}</span>
                    {t.reason && !t.done && (
                      <span className={cn('block text-[13px]', b === 'overdue' ? 'text-destructive' : 'text-muted-foreground')}>
                        {t.reason}
                      </span>
                    )}
                  </span>
                  <span className={cn('text-[14px] tabular-nums', b === 'overdue' ? 'text-destructive' : 'text-muted-foreground')}>
                    {t.time}
                  </span>
                </button>
              </div>
            ))}
          </Group>
        )
      })}
      {s.tasks.every((t) => t.done) && !showDone && (
        <Empty icon={ListChecks} title="Все задачи выполнены" text="Новые появятся после звонков и показов" />
      )}
    </Screen>
  )
}

const DAYS = ['Сегодня', 'Завтра', 'Вс, 26', 'Пн, 27', 'Вт, 28']

export function ShowingsScreen() {
  const s = useStore()
  const [day, setDay] = useState(0)
  const list = s.showings.filter((sh) => sh.day === day).sort((a, b) => a.time.localeCompare(b.time))

  return (
    <Screen
      title="Показы"
      back
      onBack={s.pop}
      actions={<GlassButton icon={CalendarPlus} label="Назначить показ" onClick={() => s.openSheet({ type: 'addShowing' })} />}
    >
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-5">
        {DAYS.map((d, i) => {
          const n = s.showings.filter((sh) => sh.day === i).length
          return (
            <button
              key={d}
              type="button"
              onClick={() => setDay(i)}
              aria-pressed={day === i}
              className={cn(
                'press flex h-[60px] min-w-[76px] shrink-0 flex-col items-center justify-center rounded-[18px] px-3',
                day === i ? 'bg-primary text-primary-foreground' : 'bg-card',
              )}
            >
              <span className="text-[14px] font-semibold">{d}</span>
              <span className={cn('text-[12px]', day === i ? 'opacity-70' : 'text-muted-foreground')}>
                {n ? `${n} показ${n > 1 ? 'а' : ''}` : '—'}
              </span>
            </button>
          )
        })}
      </div>

      {list.length === 0 ? (
        <Empty
          icon={CalendarCheck}
          title="Показов нет"
          text="Свободный день — назначьте показ из карточки клиента"
          action={
            <Button icon={CalendarPlus} onClick={() => s.openSheet({ type: 'addShowing' })}>
              Назначить
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-3 px-4">
          {list.map((sh) => {
            const c = s.clients.find((x) => x.id === sh.clientId)!
            const p = s.properties.find((x) => x.id === sh.propertyId)!
            const active = sh.status === 'scheduled' || sh.status === 'pending' || sh.status === 'confirmed'
            return (
              <article key={sh.id} className="overflow-hidden rounded-[24px] bg-card">
                <div className="flex gap-3 p-4">
                  <div className="flex w-14 shrink-0 flex-col items-center rounded-[14px] bg-secondary py-2">
                    <CalendarClock className="size-4 text-muted-foreground" aria-hidden />
                    <span className="mt-1 text-[16px] font-bold tabular-nums">{sh.time}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <Badge
                      kind={
                        sh.status === 'confirmed' || sh.status === 'done'
                          ? 'success'
                          : sh.status === 'pending'
                            ? 'warning'
                            : sh.status === 'cancelled' || sh.status === 'noshow'
                              ? 'danger'
                              : 'neutral'
                      }
                    >
                      {SHOWING_LABEL[sh.status]}
                    </Badge>
                    <button
                      type="button"
                      onClick={() => s.push({ name: 'client', id: c.id })}
                      className="mt-1 block text-left text-[17px] font-semibold"
                    >
                      {c.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => s.push({ name: 'property', id: p.id })}
                      className="block text-left text-[14px] text-muted-foreground"
                    >
                      {propertyTitle(p)} · {p.district}
                    </button>
                    <p className="mt-1 flex items-center gap-1 text-[13px] text-muted-foreground">
                      <MapPin className="size-3.5 shrink-0" aria-hidden />
                      <span className="truncate">{sh.place}</span>
                    </p>
                    {sh.outcome && (
                      <p className="mt-2 rounded-[12px] bg-secondary px-3 py-2 text-[14px]">
                        Итог: <span className="font-medium">{sh.outcome}</span>
                      </p>
                    )}
                  </div>
                </div>
                {active && (
                  <div className="flex gap-2 border-t border-separator p-3">
                    {sh.status === 'pending' ? (
                      <Button
                        size="sm"
                        icon={Check}
                        className="flex-1"
                        onClick={() => {
                          s.updateShowing(sh.id, { status: 'confirmed' })
                          s.notify('Показ подтверждён', () => s.updateShowing(sh.id, { status: 'pending' }))
                        }}
                      >
                        Подтвердить
                      </Button>
                    ) : (
                      <Button size="sm" className="flex-1" onClick={() => s.openSheet({ type: 'outcome', showingId: sh.id })}>
                        Итог показа
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={RotateCcw}
                      aria-label="Перенести"
                      onClick={() => {
                        s.updateShowing(sh.id, { status: 'moved', day: sh.day + 1 })
                        s.notify('Перенесён на следующий день', () =>
                          s.updateShowing(sh.id, { status: sh.status, day: sh.day }),
                        )
                      }}
                    >
                      Перенести
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      aria-label="Отменить показ"
                      className="w-9 px-0"
                      onClick={() => {
                        s.updateShowing(sh.id, { status: 'cancelled' })
                        s.notify('Показ отменён', () => s.updateShowing(sh.id, { status: sh.status }))
                      }}
                    >
                      <X className="size-4" aria-hidden />
                    </Button>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}
    </Screen>
  )
}

