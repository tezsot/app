'use client'

import { useRef, useState } from 'react'
import { SheetFrame } from '@/components/ios/sheet'
import { Button, Field, TextInput } from '@/components/ios/primitives'
import { propertyTitle } from '@/lib/data'
import { useStore } from '@/lib/store'

export function AddDeal({ depth, clientId = '', propertyId = '' }: { depth: number; clientId?: string; propertyId?: string }) {
  const s = useStore()
  const [cid, setCid] = useState(clientId)
  const [pid, setPid] = useState(propertyId)
  const [amount, setAmount] = useState('')
  const [next, setNext] = useState('Согласовать условия')
  const [error, setError] = useState('')
  const saving = useRef(false)
  const client = s.clients.find(c => c.id === cid)
  const properties = s.properties.filter(p => !p.draft && ['new', 'confirmed', 'recheck'].includes(p.freshness) && (!client || p.op === (client.intent === 'rent' ? 'rent' : 'sale')))
  const duplicate = s.deals.find(d => d.clientId === cid && d.propertyId === pid && d.stage < 5)
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
  const selectStyle = 'min-h-12 w-full rounded-xl bg-secondary px-3 text-[15px] focus-visible:outline-2 focus-visible:outline-primary'
  return <SheetFrame title="Новая сделка" depth={depth} onClose={s.closeSheet} onConfirm={save} confirmDisabled={!valid}>
    <div className="flex flex-col gap-4 px-4 pb-6">
      <Field label="Клиент"><select aria-label="Клиент сделки" className={selectStyle} value={cid} onChange={e => { setCid(e.target.value); setPid(''); setError('') }}><option value="">Выберите клиента</option>{s.clients.filter(c => c.status !== 'closed').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
      <Field label="Объект"><select aria-label="Объект сделки" className={selectStyle} value={pid} onChange={e => { setPid(e.target.value); setError('') }}><option value="">Выберите объект</option>{properties.map(p => <option key={p.id} value={p.id}>{propertyTitle(p)} · {p.district} · {p.address}</option>)}</select></Field>
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
