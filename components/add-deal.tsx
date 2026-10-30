'use client'

import { useRef, useState } from 'react'
import { SheetFrame } from '@/components/ios/sheet'
import { Button, Field, TextInput, SearchField, Avatar } from '@/components/ios/primitives'
import { Building2, ChevronRight, Check, UserRound } from 'lucide-react'
import { DealPropertyOption } from '@/components/deal-property-option'
import { propertyTitle } from '@/lib/data'
import { useStore } from '@/lib/store'

export function AddDeal({ depth, clientId = '', propertyId = '' }: { depth: number; clientId?: string; propertyId?: string }) {
  const s = useStore()
  const [cid, setCid] = useState(clientId)
  const [pid, setPid] = useState(propertyId)
  const [amount, setAmount] = useState('')
  const [next, setNext] = useState('Согласовать условия')
  const [error, setError] = useState('')
  const [picker, setPicker] = useState<'client' | 'property' | null>(null)
  const [query, setQuery] = useState('')
  const openPicker = (type: 'client' | 'property') => { setQuery(''); setPicker(type) }
  const saving = useRef(false)
  const client = s.clients.find(c => c.id === cid)
  const properties = s.properties.filter(p => !p.draft && ['new', 'confirmed', 'recheck'].includes(p.freshness) && (!client || p.op === (client.intent === 'rent' ? 'rent' : 'sale')))
  const duplicate = s.deals.find(d => d.clientId === cid && d.propertyId === pid && !d.cancellation && d.stage < 5)
  const valid = !!client && properties.some(p => p.id === pid) && Number.isFinite(Number(amount)) && Number(amount) > 0 && !!next.trim() && !duplicate
  const save = () => {
    if (!valid || saving.current) return
    saving.current = true
    try {
      const deal = s.createDeal({ clientId: cid, propertyId: pid, amount: Number(amount), next })
      s.closeSheet()
      s.push({ name: 'deal', id: deal.id })
      s.notify('Сделка создана. Комиссия ожидается, деньги не получены.')
    } catch (e) { setError(e instanceof Error ? e.message : 'Не удалось создать сделку'); saving.current = false }
  }
  const selectedProperty = properties.find(p => p.id === pid)
  const search = query.trim().toLocaleLowerCase()
  const filteredProperties = properties.filter(p => `${propertyTitle(p)} ${p.district} ${p.address} ${p.price}`.toLocaleLowerCase().includes(search))
  const filteredClients = s.clients.filter(c => c.status !== 'closed' && `${c.name} ${c.phone}`.toLocaleLowerCase().includes(search))
  if (picker) return <SheetFrame title={picker === 'property' ? 'Выберите объект' : 'Выберите клиента'} depth={depth} onClose={() => setPicker(null)}>
    <div className="flex flex-col gap-4 px-4 pb-6">
      <button type="button" onClick={() => setPicker(null)} className="min-h-11 self-start text-sm font-medium text-primary">Назад к сделке</button>
      <SearchField value={query} onChange={setQuery} placeholder={picker === 'property' ? 'Район, адрес или цена' : 'Имя или телефон'} />
      <p role="status" className="text-xs text-muted-foreground">{picker === 'property' ? `${filteredProperties.length} объектов · ${client ? client.intent === 'rent' ? 'для аренды' : 'для покупки' : 'все доступные'}. Черновики и недоступные объекты скрыты.` : `${filteredClients.length} клиентов · без закрытых`}</p>
      {picker === 'property' ? filteredProperties.map(p => <DealPropertyOption key={p.id} property={p} selected={p.id === pid} onClick={() => { setPid(p.id); setError(''); setPicker(null) }} />) : filteredClients.map(c => <button type="button" key={c.id} aria-pressed={cid === c.id} onClick={() => { setCid(c.id); if (c.id !== cid) setPid(''); setError(''); setPicker(null) }} className="flex min-h-20 items-center gap-3 rounded-[22px] border border-border bg-card p-4 text-left focus-visible:outline-2 focus-visible:outline-primary"><Avatar name={c.name} size={44} /><span className="flex min-w-0 flex-1 flex-col gap-1"><span className="font-medium">{c.name}</span><span className="text-xs text-muted-foreground">{c.phone} · {c.intent === 'rent' ? 'Аренда' : 'Покупка'}</span></span>{cid === c.id && <Check className="size-5 text-primary" aria-hidden />}</button>)}
      {(picker === 'property' ? !filteredProperties.length : !filteredClients.length) && <div className="flex flex-col items-center gap-3 rounded-[22px] bg-secondary px-5 py-8 text-center"><Building2 className="size-8 text-muted-foreground" aria-hidden /><p className="font-medium">{query ? 'Ничего не найдено' : 'Пока нет доступных записей'}</p><p className="text-sm text-muted-foreground">{query ? 'Попробуйте другой запрос или очистите поиск.' : 'Вернитесь к форме или добавьте запись в соответствующем разделе.'}</p>{query && <Button variant="secondary" onClick={() => setQuery('')}>Сбросить поиск</Button>}</div>}
    </div>
  </SheetFrame>
  return <SheetFrame title="Новая сделка" depth={depth} onClose={s.closeSheet} onConfirm={save} confirmDisabled={!valid}>
    <div className="flex flex-col gap-4 px-4 pb-6">
      <p className="text-sm text-muted-foreground">Свяжите клиента с объектом, затем укажите условия сделки.</p>
      <Field label="Клиент"><button type="button" aria-label="Выбрать клиента сделки" onClick={() => openPicker('client')} className="flex min-h-20 w-full items-center gap-3 rounded-[22px] border border-border bg-card p-4 text-left focus-visible:outline-2 focus-visible:outline-primary">{client ? <Avatar name={client.name} size={44} /> : <span className="flex size-11 items-center justify-center rounded-full bg-secondary"><UserRound className="size-5 text-muted-foreground" aria-hidden /></span>}<span className="flex flex-1 flex-col gap-1"><span className="text-[15px] font-medium">{client?.name ?? 'Выберите клиента'}</span><span className="text-xs text-muted-foreground">{client?.phone ?? 'Поиск по имени или телефону'}</span></span><ChevronRight className="size-5 text-muted-foreground" aria-hidden /></button></Field>
      <Field label="Объект">{selectedProperty ? <DealPropertyOption key={selectedProperty.id} property={selectedProperty} summary onClick={() => openPicker('property')} /> : <button type="button" aria-label="Выбрать объект сделки" onClick={() => openPicker('property')} className="flex min-h-24 w-full items-center gap-3 rounded-[22px] border border-border bg-card p-4 text-left focus-visible:outline-2 focus-visible:outline-primary"><span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-secondary"><Building2 className="size-6 text-muted-foreground" aria-hidden /></span><span className="flex flex-1 flex-col gap-1"><span className="text-[15px] font-medium">Выберите объект</span><span className="text-xs text-muted-foreground">Фото, адрес и стоимость · {properties.length} доступно</span></span><ChevronRight className="size-5 text-muted-foreground" aria-hidden /></button>}</Field>
      {!properties.length && <p className="text-sm text-muted-foreground">Нет доступных объектов для этой цели. Сначала добавьте объект.</p>}
      <Field label="Ожидаемая комиссия, USD"><TextInput aria-label="Ожидаемая комиссия" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Например, 1500" /></Field>
      <Field label="Следующий шаг"><TextInput aria-label="Следующий шаг сделки" value={next} onChange={e => setNext(e.target.value)} /></Field>
      <p className="text-sm text-muted-foreground">Стартовый этап — переговоры. Ваша доля — 100%. Получение комиссии отмечается отдельно; это учёт в демо, не платёж.</p>
      {duplicate && <div role="alert" className="text-sm"><p>Такая активная сделка уже существует.</p><Button variant="secondary" onClick={() => s.push({ name: 'deal', id: duplicate.id })}>Открыть сделку</Button></div>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button disabled={!valid} onClick={save}>Создать сделку</Button>
    </div>
  </SheetFrame>
}
