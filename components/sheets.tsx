'use client'

import { AddDeal } from '@/components/add-deal'
import { parsePayment, applyPayment } from '@/lib/payments'

import { relativeDate } from '@/lib/dates'

import {
  Building2,
  CalendarPlus,
  ChevronDown,
  Copy,
  ListPlus,
  Phone,
  PhoneOff,
  UserPlus,
} from 'lucide-react'
import { useState } from 'react'
import {
  Avatar,
  Badge,
  Button,
  Chip,
  Field,
  Group,
  Row,
  SearchField,
  Segmented,
  TextInput,
} from '@/components/ios/primitives'
import { SheetFrame } from '@/components/ios/sheet'
import {
  DISTRICTS,
  FRESHNESS_LABEL,
  type Freshness,
  type Intent,
  type Property,
  matchScore,
  money,
  propertyTitle,
  PROPERTY_KINDS,
} from '@/lib/data'
import { type Sheet, newId, useStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { budgetLabel } from './screens/clients'

type SheetProps<T extends Sheet['type']> = Extract<Sheet, { type: T }> & { depth: number }

function ChoiceRow({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-2 px-1">{children}</div>
}

function AddMenu({ depth }: SheetProps<'add'>) {
  const s = useStore()
  const items = [
    { icon: UserPlus, title: 'Клиент', sub: 'Имя и телефон — за 10 секунд', sheet: { type: 'addClient' } as Sheet },
    { icon: Building2, title: 'Объект', sub: 'Тип, район, цена', sheet: { type: 'addProperty' } as Sheet },
    { icon: CalendarPlus, title: 'Показ', sub: 'Клиент, объект, время', sheet: { type: 'addShowing' } as Sheet },
    { icon: ListPlus, title: 'Задача', sub: 'Напоминание о контакте', sheet: { type: 'addTask' } as Sheet },
  ]
  return (
    <SheetFrame title="Создать" onClose={s.closeSheet} detent="auto" depth={depth}>
      <div className="grid grid-cols-2 gap-2 px-4 pt-2">
        {items.map((i) => (
          <button
            key={i.title}
            type="button"
            onClick={() => s.replaceSheet(i.sheet)}
            className="press flex flex-col items-start gap-6 rounded-[22px] bg-card p-4 text-left"
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <i.icon className="size-5" aria-hidden />
            </span>
            <span>
              <span className="block text-[17px] font-semibold">{i.title}</span>
              <span className="block text-[13px] leading-snug text-muted-foreground">{i.sub}</span>
            </span>
          </button>
        ))}
      </div>
    </SheetFrame>
  )
}

function SearchSheet({ depth }: SheetProps<'search'>) {
  const s = useStore()
  const [q, setQ] = useState('')
  const ql = q.toLocaleLowerCase('ru').trim().replace(/ё/g, 'е')
  const matches = (text: string) => ql.split(/\s+/).every((word) => text.toLocaleLowerCase('ru').replace(/ё/g, 'е').includes(word))
  const phoneQuery = /^[+\d\s()-]+$/.test(ql) ? ql.replace(/\D/g, '') : ''
  const clients = ql ? s.clients.filter((c) => matches(`${c.name} ${c.phone} ${c.district ?? ''}`) || (phoneQuery.length >= 3 && c.phone.replace(/\D/g, '').includes(phoneQuery))) : []
  const props = ql ? s.properties.filter((p) => matches(`${propertyTitle(p)} ${p.district} ${p.address} ${p.kind} ${p.price} ${p.draft ? 'черновик' : ''}`)) : []
  const relatedText = (clientId?: string, propertyId?: string) => {
    const c = s.clients.find((item) => item.id === clientId)
    const p = s.properties.find((item) => item.id === propertyId)
    return `${c?.name ?? ''} ${p ? `${propertyTitle(p)} ${p.address} ${p.district}` : ''}`
  }
  const tasks = ql ? s.tasks.filter((t) => matches(`${t.title} ${relatedText(t.clientId, t.propertyId)}`)) : []
  const deals = ql ? s.deals.filter((d) => matches(`${d.id} ${d.next} ${relatedText(d.clientId, d.propertyId)}`)) : []
  const total = clients.length + props.length + tasks.length + deals.length
  return (
    <SheetFrame title="Поиск" onClose={s.closeSheet} depth={depth}>
      <div className="px-4 pt-1 pb-4">
        <SearchField value={q} onChange={setQ} placeholder="Клиенты, объекты, задачи, сделки" autoFocus />
      </div>
      {clients.length > 0 && (
        <Group header={ql ? 'Клиенты' : 'Недавние'}>
          {clients.map((c) => (
            <Row
              key={c.id}
              leading={<Avatar name={c.name} size={34} />}
              title={c.name}
              subtitle={c.phone}
              onClick={() => s.push({ name: 'client', id: c.id })}
            />
          ))}
        </Group>
      )}
      {props.length > 0 && (
        <Group header="Объекты">
          {props.map((p) => (
            <Row
              key={p.id}
              icon={Building2}
              title={propertyTitle(p)}
              subtitle={`${money(p.price, p.op)} · ${p.district}`}
              onClick={() => p.draft ? s.replaceSheet({ type: 'addProperty', propertyId: p.id }) : s.push({ name: 'property', id: p.id })}
            />
          ))}
        </Group>
      )}
      {tasks.length > 0 && <Group header={`Задачи · ${tasks.length}`}>
        {tasks.map((t) => <Row key={t.id} title={t.title} subtitle={`${t.done ? 'Выполнена' : t.time} · ${relatedText(t.clientId, t.propertyId).trim() || 'Без привязки'}`} onClick={() => s.push({ name: 'tasks', taskId: t.id })} />)}
      </Group>}
      {deals.length > 0 && <Group header={`Сделки · ${deals.length}`}>
        {deals.map((d) => <Row key={d.id} title={s.clients.find((c) => c.id === d.clientId)?.name ?? 'Сделка'} subtitle={`${relatedText(undefined, d.propertyId).trim()} · ${d.next}`} onClick={() => s.push({ name: 'deal', id: d.id })} />)}
      </Group>}
      <p role="status" aria-live="polite" className="px-8 py-2 text-[13px] text-muted-foreground">{ql ? `Найдено: ${total}` : 'Введите имя, телефон, адрес, название задачи или сделки.'}</p>
      {ql && total === 0 && (
        <p className="px-8 py-10 text-center text-[15px] text-muted-foreground">
          Ничего не найдено по «{q}». Проверьте написание или ищите по району.
        </p>
      )}
    </SheetFrame>
  )
}

const BUDGETS: Record<Intent, { label: string; min: number; max: number }[]> = {
  buy: [
    { label: 'до $60k', min: 0, max: 60000 },
    { label: '$60–90k', min: 60000, max: 90000 },
    { label: '$90–150k', min: 90000, max: 150000 },
    { label: '$150k+', min: 150000, max: 400000 },
  ],
  rent: [
    { label: 'до $400', min: 0, max: 400 },
    { label: '$400–700', min: 400, max: 700 },
    { label: '$700–1200', min: 700, max: 1200 },
    { label: '$1200+', min: 1200, max: 3000 },
  ],
}

function AddClient({ depth, clientId }: SheetProps<'addClient'>) {
  const s = useStore()
  const existing = s.clients.find((c) => c.id === clientId)
  const [name, setName] = useState(existing?.name ?? '')
  const [phone, setPhone] = useState(existing?.phone ?? '+998 ')
  const [intent, setIntent] = useState<Intent>(existing?.intent ?? 'buy')
  const [budget, setBudget] = useState<number | null>(null)
  const [min, setMin] = useState(existing?.budgetMin?.toString() ?? '')
  const [max, setMax] = useState(existing?.budgetMax?.toString() ?? '')
  const [kind, setKind] = useState(existing?.kind ?? 'Квартира')
  const [rooms, setRooms] = useState(existing?.rooms?.toString() ?? '')
  const [note, setNote] = useState(existing?.note ?? '')
  const [district, setDistrict] = useState<string | null>(existing?.district ?? null)
  const [more, setMore] = useState(!!existing)
  const digits = phone.replace(/\D/g, '')
  const duplicate = s.clients.some((c) => c.id !== clientId && c.phone.replace(/\D/g, '') === digits)
  const budgetValid = [min, max].every((v) => !v || (Number.isFinite(Number(v)) && Number(v) >= 0)) && (!min || !max || Number(min) <= Number(max))
  const roomsValid = !rooms || (Number.isInteger(Number(rooms)) && Number(rooms) > 0 && Number(rooms) <= 100)
  const valid = name.trim().length > 1 && digits.length >= 9 && digits.length <= 15 && !duplicate && budgetValid && roomsValid

  const save = () => {
    if (!valid) return
    if (clientId && !existing) return
    const id = existing?.id ?? newId('c')
    const updated = {
      ...existing, id, name: name.trim(), phone: phone.trim(), intent, kind,
      budgetMin: min ? Number(min) : undefined, budgetMax: max ? Number(max) : undefined,
      district: district ?? undefined, rooms: rooms ? Number(rooms) : undefined,
      note: note.trim() || undefined, status: existing?.status ?? 'new' as const,
      source: existing?.source ?? 'Вручную',
      history: [{ id: newId('h'), label: existing ? 'Контакты и запрос обновлены' : 'Клиент создан', when: new Intl.DateTimeFormat('ru-RU', { timeZone: 'Asia/Tashkent', dateStyle: 'short', timeStyle: 'short' }).format(s.now) }, ...(existing?.history ?? [])],
    }
    s.setClients((cs) => existing ? cs.map((c) => c.id === id ? updated : c) : [updated, ...cs])
    if (!existing) s.addTask({ title: 'Первый звонок', kind: 'call', clientId: id, dueAt: relativeDate(0) })
    s.closeSheet()
    if (!existing) s.push({ name: 'client', id })
    s.notify(existing ? 'Клиент обновлён, подбор объектов пересчитан' : 'Клиент добавлен, задача на звонок создана')
  }

  return (
    <SheetFrame title={existing ? 'Редактировать клиента' : 'Новый клиент'} onClose={s.closeSheet} onConfirm={save} confirmDisabled={!valid} depth={depth}>
      <div className="flex flex-col gap-5 px-4 pt-2">
        <Field label="Имя">
          <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Например, Азиз" autoFocus />
        </Field>
        <Field label="Телефон">
          <TextInput value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" type="tel" />
        </Field>
        {duplicate && <p role="alert" className="text-[13px] text-destructive">Клиент с этим телефоном уже существует.</p>}
        <Field label="Тип недвижимости"><ChoiceRow>{PROPERTY_KINDS.map((value) => <Chip key={value} active={kind === value} onClick={() => setKind(value)}>{value}</Chip>)}</ChoiceRow></Field>
        <Field label="Цель">
          <Segmented
            value={intent}
            onChange={(v) => {
              setIntent(v)
              setBudget(null)
              setMin('')
              setMax('')
            }}
            options={[
              { value: 'buy', label: 'Покупка' },
              { value: 'rent', label: 'Аренда' },
            ]}
          />
        </Field>
        <Field label="Бюджет">
          <ChoiceRow>
            {BUDGETS[intent].map((b, i) => (
              <Chip key={b.label} active={budget === i} onClick={() => { setBudget(budget === i ? null : i); setMin(budget === i ? '' : String(b.min ?? '')); setMax(budget === i ? '' : String(b.max ?? '')) }}>
                {b.label}
              </Chip>
            ))}
          </ChoiceRow>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={intent === 'rent' ? 'От, $/мес' : 'От, $'}><TextInput aria-label="Минимальный бюджет" value={min} inputMode="decimal" onChange={(e) => { setMin(e.target.value); setBudget(null) }} /></Field>
          <Field label={intent === 'rent' ? 'До, $/мес' : 'До, $'}><TextInput aria-label="Максимальный бюджет" value={max} inputMode="decimal" onChange={(e) => { setMax(e.target.value); setBudget(null) }} /></Field>
        </div>
        {!budgetValid && <p role="alert" className="text-[13px] text-destructive">Укажите неотрицательный бюджет: «от» не больше «до».</p>}
        <button
          type="button"
          onClick={() => setMore((v) => !v)}
          aria-expanded={more}
          className="flex h-11 items-center gap-1 self-start px-4 text-[15px] font-medium"
        >
          Район, комнаты и пожелания
          <ChevronDown className={cn('size-4 transition-transform', more && 'rotate-180')} aria-hidden />
        </button>
        {more && <>
          <Field label="Комнаты"><TextInput aria-label="Количество комнат" value={rooms} inputMode="numeric" onChange={(e) => setRooms(e.target.value)} placeholder="Неважно" /></Field>
          {!roomsValid && <p role="alert" className="text-[13px] text-destructive">Количество комнат — целое число от 1 до 100.</p>}
          <Field label="Пожелания"><TextInput value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ремонт, мебель, метро…" /></Field>
        </>}
        {more && (
          <Field label="Район">
            <ChoiceRow>
              {DISTRICTS.map((d) => (
                <Chip key={d} active={district === d} onClick={() => setDistrict(district === d ? null : d)}>
                  {d}
                </Chip>
              ))}
            </ChoiceRow>
          </Field>
        )}
        <Button size="lg" disabled={!valid} onClick={save} className="mt-2">
          Сохранить
        </Button>
        <p className="-mt-2 text-center text-[12px] text-muted-foreground">{existing ? 'История, задачи и показы сохранятся' : 'После сохранения создадим задачу на первый звонок'}</p>
      </div>
    </SheetFrame>
  )
}

function AddProperty({ depth, propertyId }: SheetProps<'addProperty'>) {
  const s = useStore()
  const existing = s.properties.find((p) => p.id === propertyId)
  const [op, setOp] = useState<'sale' | 'rent'>(existing?.op ?? 'sale')
  const [kind, setKind] = useState<Property['kind']>(existing?.kind ?? 'Квартира')
  const [district, setDistrict] = useState<string | null>(existing?.district ?? null)
  const [rooms, setRooms] = useState<number | null>(existing?.rooms ?? null)
  const [price, setPrice] = useState(existing ? String(existing.price) : '')
  const [owner, setOwner] = useState(existing?.owner ?? '')
  const [address, setAddress] = useState(existing?.address ?? '')
  const [area, setArea] = useState(existing?.area ? String(existing.area) : '')
  const amount = Number(price.replace(/\s/g, ''))
  const areaValue = Number(area.replace(',', '.'))
  const numericValid = Number.isFinite(amount) && amount >= 0 && (!area || (Number.isFinite(areaValue) && areaValue > 0))
  const valid = !!district && numericValid && amount > 0

  const save = (draft = false) => {
    if (!numericValid || (!draft && !valid)) return
    if (propertyId && !existing) return
    const id = existing?.id ?? newId('p')
    const label = new Intl.DateTimeFormat('ru-RU', { timeZone: 'Asia/Tashkent', day: 'numeric', month: 'short', year: 'numeric' }).format(s.now)
    const updated: Property = {
      ...existing, id, op, kind, district: district ?? 'Не указан',
      address: address.trim() || 'Адрес уточняется', price: amount,
      area: area ? areaValue : undefined, rooms: rooms ?? undefined,
      freshness: existing?.freshness ?? 'new', checked: existing?.checked ?? 'не проверено',
      owner: owner.trim() || 'Не указан', docs: existing?.docs ?? [], draft,
      priceHistory: !existing ? [{ label, price: amount }] : existing.price === amount ? existing.priceHistory : [...existing.priceHistory, { label, price: amount }],
    }
    s.setProperties((ps) => existing ? ps.map((p) => p.id === id ? updated : p) : [updated, ...ps])
    s.closeSheet()
    if (!existing && !draft) s.push({ name: 'property', id })
    s.notify(draft ? 'Черновик сохранён' : existing ? 'Объект обновлён' : 'Объект добавлен')
  }

  return (
    <SheetFrame title={existing ? 'Редактировать объект' : 'Новый объект'} onClose={s.closeSheet} onConfirm={() => save()} confirmDisabled={!valid} depth={depth}>
      <div className="flex flex-col gap-5 px-4 pt-2">
        <Segmented
          value={op}
          onChange={setOp}
          options={[
            { value: 'sale', label: 'Продажа' },
            { value: 'rent', label: 'Аренда' },
          ]}
        />
        <Field label="Тип">
          <ChoiceRow>
            {PROPERTY_KINDS.map((k) => (
              <Chip key={k} active={kind === k} onClick={() => setKind(k)}>
                {k}
              </Chip>
            ))}
          </ChoiceRow>
        </Field>
        {kind === 'Квартира' && (
          <Field label="Комнат">
            <ChoiceRow>
              {[1, 2, 3, 4, 5].map((r) => (
                <Chip key={r} active={rooms === r} onClick={() => setRooms(r)}>
                  {r === 5 ? '5+' : r}
                </Chip>
              ))}
            </ChoiceRow>
          </Field>
        )}
        <Field label="Район">
          <ChoiceRow>
            {DISTRICTS.map((d) => (
              <Chip key={d} active={district === d} onClick={() => setDistrict(d)}>
                {d}
              </Chip>
            ))}
          </ChoiceRow>
        </Field>
        <Field label={op === 'sale' ? 'Цена, $' : 'Цена в месяц, $'}>
          <TextInput
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            inputMode="numeric"
            placeholder={op === 'sale' ? '85 000' : '600'}
          />
        </Field>
        <Field label="Адрес"><TextInput value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Улица, дом" /></Field>
        <Field label="Площадь, м²"><TextInput value={area} onChange={(e) => setArea(e.target.value)} inputMode="decimal" placeholder="Например, 65" /></Field>
        {!numericValid && <p role="alert" className="text-[13px] text-destructive">Укажите корректную цену и положительную площадь.</p>}
        <Field label="Собственник" hint="Необязательно">
          <TextInput value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="Имя или телефон" />
        </Field>
        <div className="mt-2 flex flex-col gap-2">
          <Button size="lg" disabled={!valid} onClick={() => save()}>
            Сохранить объект
          </Button>
          <Button size="lg" variant="ghost" disabled={!numericValid} onClick={() => save(true)}>
            Сохранить черновик
          </Button>
        </div>
      </div>
    </SheetFrame>
  )
}

const WHEN = ['Сегодня', 'Завтра', 'Через 3 дня', 'Через неделю'].map((label) => ({ label }))
const TIMES = ['10:00', '12:00', '15:00', '18:00']
const TASK_PRESETS = ['Перезвонить', 'Отправить подборку', 'Уточнить цену', 'Напомнить о показе']

function AddTask({ depth, clientId, propertyId }: SheetProps<'addTask'>) {
  const s = useStore()
  const [title, setTitle] = useState(TASK_PRESETS[0])
  const [when, setWhen] = useState(0)
  const [time, setTime] = useState(TIMES[2])
  const [cid, setCid] = useState(clientId)
  const save = () => {
    if (!title.trim()) return
    s.addTask({
      title,
      kind: title.includes('звон') ? 'call' : 'message',
      clientId: cid,
      propertyId,
      dueAt: relativeDate([0, 1, 3, 7][when], time),
    })
    if (cid) s.addHistory(cid, `Задача: ${title}`)
    s.closeSheet()
    s.notify('Задача создана')
  }
  return (
    <SheetFrame title="Новая задача" onClose={s.closeSheet} onConfirm={save} confirmDisabled={!title.trim()} detent="auto" depth={depth}>
      <div className="flex flex-col gap-5 px-4 pt-2">
        <Field label="Что сделать">
          <TextInput value={title} onChange={(e) => setTitle(e.target.value)} />
          <ChoiceRow>
            {TASK_PRESETS.map((p) => (
              <Chip key={p} active={title === p} onClick={() => setTitle(p)}>
                {p}
              </Chip>
            ))}
          </ChoiceRow>
        </Field>
        {!clientId && !propertyId && (
          <Field label="Клиент">
            <ChoiceRow>
              {s.clients
                .filter((c) => c.status !== 'closed')
                .slice(0, 5)
                .map((c) => (
                  <Chip key={c.id} active={cid === c.id} onClick={() => setCid(cid === c.id ? undefined : c.id)}>
                    {c.name.split(' ')[0]}
                  </Chip>
                ))}
            </ChoiceRow>
          </Field>
        )}
        <Field label="Когда">
          <ChoiceRow>
            {WHEN.map((w, i) => (
              <Chip key={w.label} active={when === i} onClick={() => setWhen(i)}>
                {w.label}
              </Chip>
            ))}
          </ChoiceRow>
          <ChoiceRow>
            {TIMES.map((t) => (
              <Chip key={t} active={time === t} onClick={() => setTime(t)}>
                {t}
              </Chip>
            ))}
          </ChoiceRow>
        </Field>
        <Button size="lg" onClick={save}>
          Создать задачу
        </Button>
      </div>
    </SheetFrame>
  )
}

const DAY_OPTS = ['Сегодня', 'Завтра', 'Через 2 дня', 'Через 3 дня']
const SLOT_OPTS = ['10:00', '11:30', '14:00', '16:00', '18:30']

function AddShowing({ depth, clientId, propertyId }: SheetProps<'addShowing'>) {
  const s = useStore()
  const [cid, setCid] = useState(clientId ?? '')
  const [pid, setPid] = useState(propertyId ?? '')
  const [day, setDay] = useState(1)
  const [slot, setSlot] = useState(SLOT_OPTS[0])
  const c = s.clients.find((x) => x.id === cid)
  const options = s.properties
    .filter((p) => p.freshness !== 'sold' && p.freshness !== 'archived')
    .map((p) => ({ p, score: c ? matchScore(c, p) : 0 }))
    .sort((a, b) => b.score - a.score)
  const valid = !!c && c.status !== 'closed' && options.some(({ p }) => p.id === pid)

  const save = () => {
    const p = options.find(({ p }) => p.id === pid)?.p
    if (!valid || !p) return
    s.setShowings((ss) => [
      ...ss,
      { id: newId('s'), clientId: cid, propertyId: pid, startsAt: relativeDate(day, slot), status: 'pending', place: p.address },
    ])
    s.addHistory(cid, `Показ назначен: ${DAY_OPTS[day].toLowerCase()}, ${slot}`)
    s.closeSheet()
    s.notify('Показ назначен в демо. Уведомления не отправляются')
  }

  return (
    <SheetFrame title="Новый показ" onClose={s.closeSheet} onConfirm={save} confirmDisabled={!valid} depth={depth}>
      <div className="flex flex-col gap-5 pt-2">
        <div className="px-4">
          <Field label="Клиент">
            <ChoiceRow>
              {s.clients
                .filter((x) => x.status !== 'closed')
                .map((x) => (
                  <Chip key={x.id} active={cid === x.id} onClick={() => setCid(x.id)}>
                    {x.name.split(' ')[0]}
                  </Chip>
                ))}
            </ChoiceRow>
          </Field>
        </div>
        <Group header={c ? 'Объект · по совпадению' : 'Объект'} className="pb-0">
          {options.slice(0, 4).map(({ p, score }) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPid(p.id)}
              aria-pressed={pid === p.id}
              className="group/row flex w-full items-center gap-3 pl-4 text-left active:bg-accent"
            >
              {p.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image} alt="" className="size-11 shrink-0 rounded-[10px] object-cover" />
              )}
              <span className="flex min-w-0 flex-1 items-center gap-2 self-stretch border-b border-separator py-2.5 pr-4 group-last/row:border-b-0">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-medium">{propertyTitle(p)}</span>
                  <span className="block truncate text-[13px] text-muted-foreground">
                    {money(p.price, p.op)} · {p.district}
                  </span>
                </span>
                {score > 0 && <Badge kind="success">{score}%</Badge>}
                <span
                  className={cn(
                    'flex size-6 shrink-0 items-center justify-center rounded-full',
                    pid === p.id ? 'bg-primary' : 'ring-1 ring-muted-foreground/40',
                  )}
                >
                  {pid === p.id && <span className="size-2 rounded-full bg-primary-foreground" />}
                </span>
              </span>
            </button>
          ))}
        </Group>
        <div className="flex flex-col gap-5 px-4">
          <Field label="День">
            <ChoiceRow>
              {DAY_OPTS.map((d, i) => (
                <Chip key={d} active={day === i} onClick={() => setDay(i)}>
                  {d}
                </Chip>
              ))}
            </ChoiceRow>
          </Field>
          <Field label="Время">
            <ChoiceRow>
              {SLOT_OPTS.map((t) => (
                <Chip key={t} active={slot === t} onClick={() => setSlot(t)}>
                  {t}
                </Chip>
              ))}
            </ChoiceRow>
          </Field>
          <Button size="lg" disabled={!valid} onClick={save}>
            Назначить показ
          </Button>
        </div>
      </div>
    </SheetFrame>
  )
}

function CallSheet({ depth, clientId, taskId }: SheetProps<'call'>) {
  const s = useStore()
  const c = s.clients.find((x) => x.id === clientId)!
  const [phase, setPhase] = useState<'calling' | 'result'>('calling')

  const finish = (label: string, next?: () => void) => {
    s.addHistory(c.id, `Звонок: ${label}`)
    if (taskId) s.setTasks((ts) => ts.map((t) => (t.id === taskId ? { ...t, done: true } : t)))
    if (c.status === 'new' || c.status === 'contact') s.updateClient(c.id, { status: 'active' })
    if (next) next()
    else {
      s.closeSheet()
      s.notify('Итог звонка сохранён')
    }
  }

  const outcomes = [
    {
      label: 'Договорились о показе',
      primary: true,
      on: () => finish('договорились о показе', () => s.replaceSheet({ type: 'addShowing', clientId: c.id })),
    },
    {
      label: 'Перезвонить позже',
      on: () =>
        finish('перезвонить позже', () => {
          s.addTask({ title: 'Перезвонить', kind: 'call', clientId: c.id, dueAt: relativeDate(1, '12:00') })
          s.closeSheet()
          s.notify('Напомним завтра в 12:00')
        }),
    },
    {
      label: 'Не ответил',
      on: () =>
        finish('не ответил', () => {
          s.addTask({ title: 'Повторить звонок', kind: 'call', clientId: c.id, dueAt: relativeDate(0, '18:00') })
          s.closeSheet()
          s.notify('Повторный звонок в 18:00')
        }),
    },
    {
      label: 'Отправить подборку',
      on: () =>
        finish('отправить подборку', () => {
          s.addTask({ title: 'Отправить подборку', kind: 'message', clientId: c.id, dueAt: relativeDate(0) })
          s.closeSheet()
          s.notify('Задача: отправить подборку')
        }),
    },
    {
      label: 'Больше не интересно',
      on: () =>
        finish('не интересно', () => {
          s.updateClient(c.id, { status: 'closed' })
          s.closeSheet()
          s.notify('Клиент перенесён в закрытые')
        }),
    },
  ]

  return (
    <SheetFrame title={phase === 'calling' ? undefined : 'Итог звонка'} onClose={s.closeSheet} detent="auto" depth={depth}>
      {phase === 'calling' ? (
        <div className="flex flex-col items-center px-6 pt-6 pb-4">
          <div className="relative">
            <span className="anim-ring absolute inset-0 rounded-full bg-success" aria-hidden />
            <Avatar name={c.name} size={96} className="relative" />
          </div>
          <p className="mt-5 text-[24px] font-semibold">{c.name}</p>
          <p className="text-[15px] text-muted-foreground tabular-nums" role="status">
            Демо звонка · {c.phone}
          </p>
          <p className="mt-3 text-center text-[13px] text-muted-foreground">
            {c.intent === 'buy' ? 'Покупка' : 'Аренда'} · {budgetLabel(c)}
            {c.note ? ` · ${c.note}` : ''}
          </p>
          <button
            type="button"
            onClick={() => setPhase('result')}
            aria-label="Завершить звонок"
            className="press mt-8 flex size-[72px] items-center justify-center rounded-full bg-destructive text-white"
          >
            <PhoneOff className="size-7" aria-hidden />
          </button>
          <span className="mt-2 text-[13px] text-muted-foreground">Завершить</span>
        </div>
      ) : (
        <div className="flex flex-col gap-2 px-4 pt-2">
          <p className="px-1 pb-2 text-[15px] text-muted-foreground">
            Как прошёл разговор с {c.name.split(' ')[0]}? Мы сразу создадим следующий шаг.
          </p>
          {outcomes.map((o) => (
            <Button key={o.label} size="lg" variant={o.primary ? 'primary' : 'secondary'} onClick={o.on} className="w-full">
              {o.label}
            </Button>
          ))}
        </div>
      )}
    </SheetFrame>
  )
}

function OutcomeSheet({ depth, showingId }: SheetProps<'outcome'>) {
  const s = useStore()
  const sh = s.showings.find((x) => x.id === showingId)!
  const [result, setResult] = useState<string | null>(null)
  const results = ['Понравилось', 'Думает', 'Не подошло', 'Хочет ещё варианты']
  const save = () => {
    if (!result) return
    s.updateShowing(sh.id, { status: 'done', outcome: result })
    s.addHistory(sh.clientId, `Показ проведён: ${result.toLowerCase()}`)
    s.addTask({
      title: result === 'Понравилось' ? 'Обсудить условия' : result === 'Думает' ? 'Перезвонить после показа' : 'Отправить подборку',
      kind: 'call',
      clientId: sh.clientId,
      propertyId: sh.propertyId,
      dueAt: relativeDate(1, '12:00'),
    })
    s.closeSheet()
    s.notify('Итог сохранён, следующий шаг создан')
    if (result === 'Понравилось') s.openSheet({ type: 'addDeal', clientId: sh.clientId, propertyId: sh.propertyId })
  }
  return (
    <SheetFrame title="Итог показа" onClose={s.closeSheet} onConfirm={save} confirmDisabled={!result} detent="auto" depth={depth}>
      <div className="flex flex-col gap-2 px-4 pt-2">
        {results.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setResult(r)}
            aria-pressed={result === r}
            className={cn(
              'press flex h-[52px] items-center rounded-[16px] px-4 text-left text-[17px] font-medium',
              result === r ? 'bg-primary text-primary-foreground' : 'bg-card',
            )}
          >
            {r}
          </button>
        ))}
        <Button size="lg" disabled={!result} onClick={save} className="mt-3">
          Сохранить итог
        </Button>
      </div>
    </SheetFrame>
  )
}

function PriceSheet({ depth, propertyId }: SheetProps<'price'>) {
  const s = useStore()
  const p = s.properties.find((x) => x.id === propertyId)!
  const [value, setValue] = useState(String(p.price))
  const n = Number(value.replace(/\D/g, ''))
  const diff = n - p.price
  const save = () => {
    const prev = { price: p.price, priceHistory: p.priceHistory }
    s.updateProperty(p.id, {
      price: n,
      priceHistory: [...p.priceHistory, { label: 'сейчас', price: n }],
      freshness: 'confirmed',
      checked: 'только что',
    })
    s.closeSheet()
    s.notify('Цена обновлена', () => s.updateProperty(p.id, prev))
  }
  return (
    <SheetFrame title="Цена" onClose={s.closeSheet} onConfirm={save} confirmDisabled={!n || n === p.price} detent="auto" depth={depth}>
      <div className="flex flex-col gap-4 px-4 pt-2">
        <TextInput
          value={value}
          onChange={(e) => setValue(e.target.value)}
          inputMode="numeric"
          autoFocus
          aria-label="Новая цена"
          className="h-16 text-center text-[32px] font-bold tabular-nums"
        />
        <p className="text-center text-[14px] text-muted-foreground tabular-nums">
          Было {money(p.price, p.op)}
          {diff !== 0 && n > 0 && (
            <span className={cn('ml-1 font-medium', diff < 0 ? 'text-success-ink' : 'text-destructive')}>
              {diff > 0 ? '+' : '−'}
              {money(Math.abs(diff))}
            </span>
          )}
        </p>
        <div className="flex justify-center gap-2">
          {[-5, -3, 3].map((pct) => (
            <Chip key={pct} onClick={() => setValue(String(Math.round((p.price * (100 + pct)) / 100)))}>
              {pct > 0 ? '+' : ''}
              {pct}%
            </Chip>
          ))}
        </div>
        <p className="text-center text-[12px] text-muted-foreground">Прежняя цена сохранится в истории</p>
      </div>
    </SheetFrame>
  )
}

function FreshnessSheet({ depth, propertyId }: SheetProps<'freshness'>) {
  const s = useStore()
  const p = s.properties.find((x) => x.id === propertyId)!
  const opts: Freshness[] = ['confirmed', 'recheck', 'unavailable', 'sold', 'archived']
  return (
    <SheetFrame title="Статус объекта" onClose={s.closeSheet} detent="auto" depth={depth}>
      <Group>
        {opts.map((o) => (
          <Row
            key={o}
            title={FRESHNESS_LABEL[o]}
            chevron={false}
            trailing={p.freshness === o ? <span className="size-2.5 rounded-full bg-primary" /> : undefined}
            onClick={() => {
              const prev = { freshness: p.freshness, checked: p.checked }
              s.updateProperty(p.id, { freshness: o, checked: 'только что' })
              s.closeSheet()
              s.notify(`Статус: ${FRESHNESS_LABEL[o]}`, () => s.updateProperty(p.id, prev))
            }}
          />
        ))}
      </Group>
      <div className="px-4">
        <Button variant="secondary" className="w-full" icon={Phone} onClick={() => s.notify(`Звонок: ${p.owner}`)}>
          Позвонить собственнику
        </Button>
      </div>
    </SheetFrame>
  )
}

function ListingSheet({ depth, propertyId }: SheetProps<'listing'>) {
  const s = useStore()
  const p = s.properties.find((x) => x.id === propertyId)!
  const [channel, setChannel] = useState<'tg' | 'olx'>('tg')
  const text =
    channel === 'tg'
      ? `${propertyTitle(p)}, ${p.district}\n${p.area ? `${p.area} м² · ` : ''}${p.floor ? `${p.floor}/${p.floors} этаж` : ''}\nОриентир: ${p.address}\nЦена: ${money(p.price, p.op)}\n\nЗвоните: +998 90 000-11-22`
      : `${p.op === 'sale' ? 'Продаётся' : 'Сдаётся'} ${propertyTitle(p).toLowerCase()} в районе ${p.district}. ${p.area ? `Площадь ${p.area} м². ` : ''}${p.floor ? `Этаж ${p.floor} из ${p.floors}. ` : ''}Ориентир: ${p.address}. Цена ${money(p.price, p.op)}. Без посредников при показе, документы готовы к проверке.`
  return (
    <SheetFrame title="Объявление" onClose={s.closeSheet} detent="auto" depth={depth}>
      <div className="flex flex-col gap-4 px-4 pt-2">
        <Segmented
          value={channel}
          onChange={setChannel}
          options={[
            { value: 'tg', label: 'Telegram' },
            { value: 'olx', label: 'OLX' },
          ]}
        />
        <div className="rounded-[18px] bg-card p-4 text-[15px] leading-relaxed whitespace-pre-line">{text}</div>
        <Button
          size="lg"
          icon={Copy}
          onClick={() => {
            navigator.clipboard?.writeText(text).catch(() => {})
            s.closeSheet()
            s.notify('Текст скопирован')
          }}
        >
          Скопировать текст
        </Button>
      </div>
    </SheetFrame>
  )
}

function PaymentSheet({ depth, dealId }: SheetProps<'payment'>) {
  const s = useStore()
  const d = s.deals.find((x) => x.id === dealId)!
  const left = (Math.round(d.commission.amount * 100) - Math.round(d.commission.received * 100)) / 100
  const [value, setValue] = useState(String(left))
  const cents = parsePayment(value)
  const n = cents === null ? 0 : cents / 100
  const valid = cents !== null && cents <= Math.round(left * 100)
  const save = () => {
    if (!valid || cents === null) return
    s.updateDeal(d.id, (x) => ({
      ...x,
      commission: { ...x.commission, ...applyPayment(x.commission.amount, x.commission.received, cents) },
      history: [{ id: newId('e'), label: `Получено ${money(n)}`, when: new Intl.DateTimeFormat('ru-RU', { timeZone: 'Asia/Tashkent', dateStyle: 'short', timeStyle: 'short' }).format(s.now) }, ...x.history],
    }))
    s.closeSheet()
    s.notify(`Оплата ${money(n)} отмечена`)
  }
  return (
    <SheetFrame title="Оплата комиссии" onClose={s.closeSheet} onConfirm={save} confirmDisabled={!valid} detent="auto" depth={depth}>
      <div className="flex flex-col gap-4 px-4 pt-2">
        <TextInput
          value={value}
          onChange={(e) => setValue(e.target.value)}
          inputMode="decimal"
          autoFocus
          aria-label="Сумма в USD"
          aria-invalid={!valid}
          aria-describedby="payment-help"
          className="h-16 text-center text-[32px] font-bold tabular-nums"
        />
        <p id="payment-help" role={!valid ? 'alert' : undefined} className="text-center text-[13px] text-muted-foreground">{valid ? 'USD · запишите только фактически полученную сумму' : 'Введите сумму больше нуля, не выше остатка, максимум два знака после запятой'}</p>
        <div className="flex justify-center gap-2">
          <Chip active={n === left} onClick={() => setValue(String(left))}>
            Весь остаток
          </Chip>
          <Chip active={n === Math.round(left / 2)} onClick={() => setValue(String(Math.round(left / 2)))}>
            Половина
          </Chip>
        </div>
        <p className="text-center text-[13px] text-muted-foreground tabular-nums">
          Оста��ок {money(left)} · платит {d.commission.payer.toLowerCase()}
        </p>
        <Button size="lg" disabled={!n} onClick={save}>
          Отметить получение
        </Button>
      </div>
    </SheetFrame>
  )
}

export function SheetHost() {
  const { sheets } = useStore()
  return (
    <>
      {sheets.map((sheet, i) => {
        const key = `${sheet.type}-${i}`
        switch (sheet.type) {
          case 'add':
            return <AddMenu key={key} {...sheet} depth={i} />
          case 'search':
            return <SearchSheet key={key} {...sheet} depth={i} />
          case 'addDeal':
            return <AddDeal key={key} {...sheet} depth={i} />
          case 'addClient':
            return <AddClient key={key} {...sheet} depth={i} />
          case 'addProperty':
            return <AddProperty key={key} {...sheet} depth={i} />
          case 'addTask':
            return <AddTask key={key} {...sheet} depth={i} />
          case 'addShowing':
            return <AddShowing key={key} {...sheet} depth={i} />
          case 'call':
            return <CallSheet key={key} {...sheet} depth={i} />
          case 'outcome':
            return <OutcomeSheet key={key} {...sheet} depth={i} />
          case 'price':
            return <PriceSheet key={key} {...sheet} depth={i} />
          case 'freshness':
            return <FreshnessSheet key={key} {...sheet} depth={i} />
          case 'listing':
            return <ListingSheet key={key} {...sheet} depth={i} />
          case 'payment':
            return <PaymentSheet key={key} {...sheet} depth={i} />
        }
      })}
    </>
  )
}
