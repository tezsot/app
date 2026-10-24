'use client'

import {
  Building2,
  CalendarPlus,
  FileCheck2,
  Megaphone,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Share,
  TrendingDown,
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
  IconTile,
  Progress,
  Row,
  Screen,
  Segmented,
} from '@/components/ios/primitives'
import { FRESHNESS_LABEL, type Freshness, type Property, matchScore, money, propertyTitle } from '@/lib/data'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { budgetLabel } from './clients'

export function freshnessKind(f: Freshness) {
  if (f === 'confirmed' || f === 'new') return 'success' as const
  if (f === 'recheck') return 'warning' as const
  if (f === 'unavailable') return 'danger' as const
  return 'neutral' as const
}

function PropertyCard({ p, onOpen }: { p: Property; onOpen: () => void }) {
  return (
    <button type="button" onClick={onOpen} className="press block w-full overflow-hidden rounded-[24px] bg-card text-left">
      <div className="relative aspect-[16/10] bg-secondary">
        {p.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.image} alt={`${propertyTitle(p)}, ${p.district}`} className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center">
            <Building2 className="size-10 text-muted-foreground/40" aria-hidden />
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className="glass rounded-full px-2.5 py-1 text-[12px] font-semibold">
            {p.op === 'sale' ? 'Продажа' : 'Аренда'}
          </span>
        </div>
        {p.freshness !== 'confirmed' && (
          <div className="absolute top-3 right-3">
            <Badge kind={freshnessKind(p.freshness)} className="glass h-[26px] px-2.5">
              {FRESHNESS_LABEL[p.freshness]}
            </Badge>
          </div>
        )}
      </div>
      <div className="px-4 pt-3 pb-4">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-[22px] font-bold tabular-nums">{money(p.price, p.op)}</p>
          {p.priceHistory.length > 1 && (
            <span className="flex items-center gap-0.5 text-[13px] font-medium text-success-ink">
              <TrendingDown className="size-3.5" aria-hidden />
              {Math.round(((p.priceHistory[0].price - p.price) / p.priceHistory[0].price) * 100)}%
            </span>
          )}
        </div>
        <p className="mt-0.5 text-[15px]">
          {propertyTitle(p)}
          {p.area && p.kind === 'Квартира' ? ` · ${p.area} м²` : ''}
          {p.floor ? ` · ${p.floor}${p.floors ? `/${p.floors}` : ''} эт.` : ''}
        </p>
        <p className="truncate text-[13px] text-muted-foreground">
          {p.district} · {p.address}
        </p>
        <p className={cn('mt-2 text-[12px]', p.freshness === 'recheck' ? 'text-warning-ink' : 'text-muted-foreground')}>
          Проверено {p.checked}
        </p>
      </div>
    </button>
  )
}

function PropertyListItem({ p, onOpen }: { p: Property; onOpen: () => void }) {
  return (
    <button type="button" onClick={onOpen} className="press flex w-full items-center gap-3 rounded-[20px] bg-card p-3 text-left focus-visible:outline-2 focus-visible:outline-primary">
      <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-secondary">
        {p.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.image} alt="" loading="lazy" className="size-full object-cover" />
        ) : <Building2 className="size-7 text-muted-foreground" aria-hidden />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[17px] font-bold tabular-nums">{money(p.price, p.op)}</p>
        <p className="truncate text-[14px]">{propertyTitle(p)}{p.area && p.kind === 'Квартира' ? ` · ${p.area} м²` : ''}</p>
        <p className="truncate text-[12px] text-muted-foreground">{p.district} · {p.address}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-muted-foreground">{p.op === 'sale' ? 'Продажа' : 'Аренда'}</span>
          <Badge kind={freshnessKind(p.freshness)}>{FRESHNESS_LABEL[p.freshness]}</Badge>
        </div>
      </div>
    </button>
  )
}

export function PropertiesScreen() {
  const s = useStore()
  const [view, setView] = useState<'cards' | 'list'>('cards')
  const [op, setOp] = useState<'all' | 'sale' | 'rent'>('all')
  const [state, setState] = useState<'all' | 'recheck' | 'active' | 'archive'>('all')

  const list = s.properties
    .filter((p) => op === 'all' || p.op === op)
    .filter((p) => {
      if (state === 'recheck') return p.freshness === 'recheck'
      if (state === 'active') return p.freshness === 'confirmed' || p.freshness === 'new'
      if (state === 'archive') return p.freshness === 'sold' || p.freshness === 'archived'
      return p.freshness !== 'archived'
    })
  const recheck = s.properties.filter((p) => p.freshness === 'recheck').length

  return (
    <Screen
      title="Объекты"
      actions={<GlassButton icon={Plus} label="Новый объект" onClick={() => s.openSheet({ type: 'addProperty' })} />}
    >
      <div className="px-4 pb-3">
        <Segmented
          value={op}
          onChange={setOp}
          options={[
            { value: 'all', label: 'Все' },
            { value: 'sale', label: 'Продажа' },
            { value: 'rent', label: 'Аренда' },
          ]}
        />
      </div>
      <ChipScroller>
        <Chip active={state === 'all'} onClick={() => setState('all')}>
          Все
        </Chip>
        <Chip active={state === 'recheck'} onClick={() => setState('recheck')} count={recheck}>
          Нужна проверка
        </Chip>
        <Chip active={state === 'active'} onClick={() => setState('active')}>
          Актуальные
        </Chip>
        <Chip active={state === 'archive'} onClick={() => setState('archive')}>
          Продано и архив
        </Chip>
      </ChipScroller>
      <div className="flex items-center justify-between gap-3 px-4 pb-3">
        <span className="text-[13px] text-muted-foreground">Найдено: {list.length}</span>
        <div className="flex rounded-full bg-secondary p-1" role="group" aria-label="Вид объектов">
          {([{ value: 'cards', label: 'Карточки' }, { value: 'list', label: 'Список' }] as const).map((option) => (
            <button key={option.value} type="button" aria-pressed={view === option.value} onClick={() => setView(option.value)} className={cn('min-h-10 rounded-full px-3 text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-primary', view === option.value ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground')}>
              {option.label}
            </button>
          ))}
        </div>
      </div>
      {list.length === 0 ? (
        <Empty
          icon={Building2}
          title="Нет объектов"
          text="Добавьте объект: достаточно типа, района и цены — остальное позже"
          action={
            <Button icon={Plus} onClick={() => s.openSheet({ type: 'addProperty' })}>
              Добавить объект
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-3 px-4">
          {list.map((p) => (
            view === 'cards' ? (
              <PropertyCard key={p.id} p={p} onOpen={() => s.push({ name: 'property', id: p.id })} />
            ) : (
              <PropertyListItem key={p.id} p={p} onOpen={() => s.push({ name: 'property', id: p.id })} />
            )
          ))}
        </div>
      )}
    </Screen>
  )
}

export function PropertyDetail({ id }: { id: string }) {
  const s = useStore()
  const p = s.properties.find((x) => x.id === id)
  if (!p) return null
  const confirmed = p.docs.filter((d) => d.status === 'confirmed').length
  const interested = s.clients
    .map((c) => ({ c, score: matchScore(c, p) }))
    .filter((m) => m.score > 0 && m.c.status !== 'closed')
  const max = Math.max(...p.priceHistory.map((h) => h.price))

  const hero = (
    <div className="relative h-[320px] bg-secondary">
      {p.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.image} alt={`${propertyTitle(p)}, ${p.district}`} className="size-full object-cover" />
      )}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </div>
  )

  return (
    <Screen
      title={money(p.price, p.op)}
      largeTitle={false}
      back
      onBack={s.pop}
      hero={hero}
      actions={
        <>
          <GlassButton icon={Share} label="Поделиться" onClick={() => s.notify('Ссылка на объект скопирована')} />
          <GlassButton icon={Pencil} label="Изменить цену" onClick={() => s.openSheet({ type: 'price', propertyId: p.id })} />
        </>
      }
    >
      <div className="-mt-10 px-5 pb-5">
        <div className="flex flex-wrap gap-1.5">
          <Badge kind="dark">{p.op === 'sale' ? 'Продажа' : 'Аренда'}</Badge>
          <Badge kind={freshnessKind(p.freshness)}>{FRESHNESS_LABEL[p.freshness]}</Badge>
        </div>
        <h1 className="mt-2 text-[32px] leading-tight font-bold tabular-nums">{money(p.price, p.op)}</h1>
        <p className="text-[17px]">
          {propertyTitle(p)}
          {p.area && p.kind === 'Квартира' ? `, ${p.area} м²` : ''}
        </p>
        <p className="text-[15px] text-muted-foreground">
          {p.district} · {p.address}
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2 px-4 pb-5">
        {[
          { icon: Phone, label: 'Владелец', on: () => s.notify(`Звонок: ${p.owner}`) },
          { icon: CalendarPlus, label: 'Показ', on: () => s.openSheet({ type: 'addShowing', propertyId: p.id }) },
          { icon: Megaphone, label: 'Объявление', on: () => s.openSheet({ type: 'listing', propertyId: p.id }) },
          { icon: RefreshCw, label: 'Статус', on: () => s.openSheet({ type: 'freshness', propertyId: p.id }) },
        ].map((a) => (
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

      <section className="px-4 pb-6" aria-label="Актуальность">
        <div className={cn('rounded-[22px] p-4', p.freshness === 'recheck' ? 'bg-warning/12' : 'bg-card')}>
          <div className="flex items-start gap-3">
            <IconTile icon={RefreshCw} tone={p.freshness === 'recheck' ? 'warning' : 'success'} />
            <div className="min-w-0 flex-1">
              <p className="text-[16px] font-semibold">
                {p.freshness === 'recheck' ? 'Данные могли устареть' : 'Данные актуальны'}
              </p>
              <p className="text-[13px] text-muted-foreground">
                Проверено {p.checked} · собственник {p.owner}
              </p>
            </div>
          </div>
          {p.freshness === 'recheck' && (
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  const prev = { freshness: p.freshness, checked: p.checked }
                  s.updateProperty(p.id, { freshness: 'confirmed', checked: 'только что' })
                  s.notify('Актуальность подтверждена', () => s.updateProperty(p.id, prev))
                }}
              >
                Всё в силе
              </Button>
              <Button size="sm" variant="secondary" onClick={() => s.openSheet({ type: 'freshness', propertyId: p.id })}>
                Есть изменения
              </Button>
            </div>
          )}
        </div>
      </section>

      <Group header="Характеристики">
        <Row title="Тип" value={p.kind} />
        {p.rooms && <Row title="Комнат" value={p.rooms} />}
        {p.area && <Row title="Площадь" value={`${p.area} м²`} />}
        {p.floor && <Row title="Этаж" value={p.floors ? `${p.floor} из ${p.floors}` : p.floor} />}
        <Row title="Собственник" value={p.owner} />
      </Group>

      {p.priceHistory.length > 1 && (
        <Group header="История цены">
          <div className="flex items-end gap-3 px-4 pt-4 pb-3">
            {p.priceHistory.map((h, i) => (
              <div key={h.label} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="text-[12px] font-medium tabular-nums">{money(h.price)}</span>
                <div
                  className={cn(
                    'w-full rounded-[8px]',
                    i === p.priceHistory.length - 1 ? 'bg-primary' : 'bg-secondary',
                  )}
                  style={{ height: `${(h.price / max) * 72}px` }}
                />
                <span className="text-[12px] text-muted-foreground">{h.label}</span>
              </div>
            ))}
          </div>
        </Group>
      )}

      {p.op === 'sale' && p.docs.length > 0 && (
        <Group
          header="Документы"
          footer="Личный чек-лист. Не является юридическим заключением — сложные случаи передайте специалисту."
        >
          <button
            type="button"
            onClick={() => s.push({ name: 'docs', id: p.id })}
            className="flex w-full items-center gap-3 px-4 py-4 text-left active:bg-accent"
          >
            <IconTile icon={FileCheck2} tone="dark" />
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between">
                <span className="text-[16px] font-medium">Проверка документов</span>
                <span className="text-[13px] text-muted-foreground tabular-nums">
                  {confirmed} из {p.docs.length}
                </span>
              </span>
              <Progress value={(confirmed / p.docs.length) * 100} className="mt-2" />
              {p.docs.some((d) => d.status === 'needs') && (
                <span className="mt-2 block text-[13px] text-warning-ink">Есть пункты на доп. проверку</span>
              )}
            </span>
          </button>
        </Group>
      )}

      <Group header={`Подходит клиентам · ${interested.length}`}>
        {interested.length === 0 ? (
          <Row title="Нет подходящих клиентов" subtitle="Объект появится в подборках, когда запрос совпадёт" />
        ) : (
          interested.map(({ c, score }) => (
            <Row
              key={c.id}
              leading={<Avatar name={c.name} size={36} />}
              title={c.name}
              subtitle={`${budgetLabel(c)} · совпадение ${score}%`}
              onClick={() => s.push({ name: 'client', id: c.id })}
            />
          ))
        )}
      </Group>
    </Screen>
  )
}

