'use client'

import { PartnerAgreement } from '@/components/partner-agreement'

import { ArrowRight, Building2, Check, Handshake, Wallet } from 'lucide-react'
import { useState } from 'react'
import { SheetFrame } from '@/components/ios/sheet'
import { createPortal } from 'react-dom'
import { cancelDeal } from '@/lib/deal-cancellation'
import { Avatar, Badge, Button, Group, Progress, Row, Screen, Segmented } from '@/components/ios/primitives'
import { DEAL_STAGES, type Deal, type PayStatus, money, propertyTitle } from '@/lib/data'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const PAY_LABEL: Record<PayStatus, string> = { expected: 'Ожидается', partial: 'Частично', paid: 'Получено' }
const payKind = (s: PayStatus) => (s === 'paid' ? 'success' : s === 'partial' ? 'warning' : 'neutral') as 'success'

function myShare(d: Deal) {
  return (d.commission.amount * (d.commission.split.find((x) => x.name === 'Вы')?.share ?? 100)) / 100
}

export function DealsScreen() {
  const s = useStore()
  const [view, setView] = useState<'funnel' | 'money'>('funnel')
  const client = (id: string) => s.clients.find((c) => c.id === id)!
  const property = (id: string) => s.properties.find((p) => p.id === id)!

  const expected = s.deals.filter(d => !d.cancellation).reduce((sum, d) => sum + (myShare(d) - (d.commission.received * myShare(d)) / d.commission.amount), 0)
  const received = s.deals.reduce((sum, d) => sum + (d.commission.received * myShare(d)) / d.commission.amount, 0)

  return (
    <Screen title="Сделки" actions={<Button size="sm" onClick={() => s.openSheet({ type: 'addDeal' })}>Создать</Button>}>
      <div className="px-4 pb-4">
        <Segmented
          value={view}
          onChange={setView}
          options={[
            { value: 'funnel', label: 'Воронка' },
            { value: 'money', label: 'Комиссии' },
          ]}
        />
      </div>

      {view === 'funnel' ? (
        <>
          <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-5">
          {DEAL_STAGES.map((st, i) => {
              const n = s.deals.filter((d) => !d.cancellation && d.stage === i).length
              return (
                <div
                  key={st}
                  className={cn(
                    'flex min-w-[92px] shrink-0 flex-col rounded-[18px] px-3 py-2.5',
                    n ? 'bg-card' : 'bg-card/50 text-muted-foreground',
                  )}
                >
                  <span className="text-[22px] font-bold tabular-nums">{n}</span>
                  <span className="text-[12px]">{st}</span>
                </div>
              )
            })}
          </div>
          {s.deals.some(d => d.cancellation) && <Group header="Отменённые">{s.deals.filter(d => d.cancellation).map(d => <Row key={d.id} title={client(d.clientId).name} subtitle={d.cancellation?.reason} onClick={() => s.push({ name: 'deal', id: d.id })} />)}</Group>}
          {DEAL_STAGES.map((st, i) => {
            const list = s.deals.filter((d) => !d.cancellation && d.stage === i)
            if (!list.length) return null
            return (
              <Group key={st} header={st}>
                {list.map((d) => (
                  <Row
                    key={d.id}
                    leading={<Avatar name={client(d.clientId).name} size={40} />}
                    title={<span className="font-medium">{client(d.clientId).name}</span>}
                    subtitle={
                      <>
                        <span className="block truncate">
                          {propertyTitle(property(d.propertyId))} · {money(property(d.propertyId).price)}
                        </span>
                        <span className="mt-0.5 flex items-center gap-1 text-foreground">
                          <ArrowRight className="size-3.5" aria-hidden />
                          <span className="truncate">{d.next}</span>
                        </span>
                      </>
                    }
                    onClick={() => s.push({ name: 'deal', id: d.id })}
                  />
                ))}
              </Group>
            )
          })}
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 px-4 pb-6">
            <div className="rounded-[22px] bg-primary p-4 text-primary-foreground">
              <p className="text-[13px] opacity-70">Ожидается</p>
              <p className="mt-1 text-[26px] font-bold tabular-nums">{money(Math.round(expected))}</p>
            </div>
            <div className="rounded-[22px] bg-card p-4">
              <p className="text-[13px] text-muted-foreground">Получено</p>
              <p className="mt-1 text-[26px] font-bold tabular-nums">{money(Math.round(received))}</p>
            </div>
          </div>
          <Group header="По сделкам" footer="Суммы указаны с учётом вашей доли при разделе">
            {s.deals.map((d) => (
              <Row
                key={d.id}
                icon={Wallet}
                tone={d.commission.status === 'partial' ? 'warning' : 'neutral'}
                title={client(d.clientId).name}
                subtitle={
                  <span className="flex items-center gap-1.5">
                    <Badge kind={payKind(d.commission.status)}>{d.cancellation ? 'Отменена' : PAY_LABEL[d.commission.status]}</Badge>
                    <span>до {d.commission.due}</span>
                  </span>
                }
                value={money(Math.round(myShare(d)))}
                onClick={() => s.push({ name: 'deal', id: d.id })}
              />
            ))}
          </Group>
        </>
      )}
    </Screen>
  )
}

export function DealDetail({ id }: { id: string }) {
  const s = useStore()
  const d = s.deals.find((x) => x.id === id)
  const [editingStage, setEditingStage] = useState(false)
  const [nextStep, setNextStep] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [reason, setReason] = useState('')
  if (!d) return null
  const c = s.clients.find((x) => x.id === d.clientId)!
  const p = s.properties.find((x) => x.id === d.propertyId)!
  const left = d.commission.amount - d.commission.received

  const advance = () => {
    if (d.stage >= DEAL_STAGES.length - 1 || !editingStage || (d.stage < DEAL_STAGES.length - 2 && !nextStep.trim())) return
    s.updateDeal(d.id, (x) => {
      if (x.cancellation || x.stage !== d.stage) return x
      const stage = x.stage + 1
      const next = stage === DEAL_STAGES.length - 1 ? 'Сделка завершена' : nextStep.trim()
      return {
        ...x, stage, next,
        history: [{ id: crypto.randomUUID(), label: `Этап → ${DEAL_STAGES[stage]}. ${next}`, when: new Intl.DateTimeFormat('ru-RU', { timeZone: 'Asia/Tashkent', dateStyle: 'short', timeStyle: 'short' }).format(s.now) }, ...x.history],
      }
    })
    setEditingStage(false)
    setNextStep('')
    s.notify(`Этап: ${DEAL_STAGES[d.stage + 1]}`)
  }

  return (
    <Screen title="Сделка" back onBack={s.pop} largeTitle={false}>
      <div className="px-5 pb-5">
        <p className="text-[13px] font-medium text-muted-foreground">
          {d.type === 'sale' ? 'Продажа' : 'Аренда'} · {money(p.price, p.op)}
        </p>
        <h1 className="text-[28px] leading-tight font-bold">{c.name}</h1>
        <p className="text-[15px] text-muted-foreground">{propertyTitle(p)}, {p.district}</p>
      </div>

      <section aria-label="Этап сделки" className="px-4 pb-6">
        <div className="rounded-[22px] bg-card p-4">
          <ol className="flex items-center">
            {DEAL_STAGES.map((st, i) => (
              <li key={st} className="flex flex-1 items-center last:flex-none">
                <span
                  aria-label={`${st}${i === d.stage ? ' — текущий' : ''}`}
                  className={cn(
                    'flex size-7 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold',
                    i < d.stage && 'bg-primary text-primary-foreground',
                    i === d.stage && 'bg-primary text-primary-foreground ring-4 ring-primary/15',
                    i > d.stage && 'bg-secondary text-muted-foreground',
                  )}
                >
                  {i < d.stage ? <Check className="size-3.5" strokeWidth={3} aria-hidden /> : i + 1}
                </span>
                {i < DEAL_STAGES.length - 1 && (
                  <span className={cn('mx-1 h-0.5 flex-1 rounded-full', i < d.stage ? 'bg-primary' : 'bg-secondary')} />
                )}
              </li>
            ))}
          </ol>
          <p className="mt-3 text-[13px] text-muted-foreground">Текущий этап</p>
          <p className="text-[20px] font-semibold">{d.cancellation ? 'Отменена' : DEAL_STAGES[d.stage]}</p>
          {d.cancellation && <p className="mt-2 text-[14px] text-muted-foreground">Причина: {d.cancellation.reason}</p>}
          <div className="mt-3 rounded-[14px] bg-secondary px-3 py-2.5">
            <p className="text-[12px] text-muted-foreground">Следующий шаг</p>
            <p className="text-[15px] font-medium">{d.next}</p>
          </div>
          {!d.cancellation && d.stage < DEAL_STAGES.length - 1 && (
            editingStage ? createPortal(
              <div className="fixed inset-0 z-[100] mx-auto max-w-[600px]">
              <SheetFrame title="Переход этапа" onClose={() => { setEditingStage(false); setNextStep('') }} onConfirm={advance} confirmLabel="Подтвердить" confirmDisabled={d.stage < DEAL_STAGES.length - 2 && !nextStep.trim()} detent="auto">
              <div className="space-y-3 px-5 py-4">
                <p className="text-[15px] font-medium">Подтвердить этап «{DEAL_STAGES[d.stage + 1]}»?</p>
                {d.stage < DEAL_STAGES.length - 2 && <label className="block text-[13px]">Следующий шаг
                  <input autoFocus value={nextStep} onChange={(e) => setNextStep(e.target.value)} maxLength={500} placeholder="Например, согласовать дату подписания" className="mt-2 min-h-11 w-full rounded-xl border border-border bg-background px-3 text-[16px] focus-visible:outline-primary" />
                </label>}
                <p className="text-[13px] text-muted-foreground">Полученные оплаты сохранятся. Переход этапа не означает получение комиссии.</p>
              </div>
              </SheetFrame>
              </div>, document.body
            ) : <Button className="mt-3 w-full" onClick={() => setEditingStage(true)}>
              Перевести: {DEAL_STAGES[d.stage + 1]}
            </Button>
          )}
        </div>
      </section>

      <Group header="Комиссия" footer={d.cancellation ? 'Сделка отменена: остаток исключён из прогноза. Фактические оплаты сохранены; возврат денег не выполнялся.' : undefined}>
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-baseline justify-between">
            <p className="text-[28px] font-bold tabular-nums">{money(d.commission.amount)}</p>
            <Badge kind={payKind(d.commission.status)}>{d.cancellation ? 'Отменена' : PAY_LABEL[d.commission.status]}</Badge>
          </div>
          <Progress value={(d.commission.received / d.commission.amount) * 100} className="mt-3" />
          <p className="mt-2 text-[13px] text-muted-foreground tabular-nums">
            Получено {money(d.commission.received)}
            {left > 0 && ` · осталось ${money(left)}`}
          </p>
        </div>
        <Row title="Кто платит" value={d.commission.payer} />
        <Row title="Срок" value={d.commission.due} />
        {d.commission.split.map((x) => (
          <Row
            key={x.name}
            title={x.name}
            value={`${x.share}% · ${money(Math.round((d.commission.amount * x.share) / 100))}`}
          />
        ))}
        {left > 0 && !d.cancellation && (
          <div className="p-3">
            <Button variant="secondary" className="w-full" icon={Wallet} onClick={() => s.openSheet({ type: 'payment', dealId: d.id })}>
              Отметить оплату
            </Button>
          </div>
        )}
      </Group>

      {!d.cancellation && d.stage < 5 && <div className="px-4 pb-6"><Button variant="secondary" onClick={() => setCancelling(true)}>Отменить сделку</Button></div>}
      {cancelling && createPortal(<div className="fixed inset-0 z-[100] mx-auto max-w-[600px]">
        <SheetFrame title="Отмена сделки" confirmLabel="Отменить сделку" confirmDisabled={!reason.trim()} onClose={() => { setCancelling(false); setReason('') }} onConfirm={() => {
          if (!reason.trim()) return
          const at = new Date().toISOString()
          const eventId = crypto.randomUUID()
          s.updateDeal(d.id, current => cancelDeal(current, reason, at, eventId))
          setCancelling(false)
          setReason('')
          s.notify('Сделка отменена. История и оплаты сохранены')
        }} detent="auto">
          <div className="space-y-3 p-5">
            <label className="block text-[14px]">Причина отмены<textarea autoFocus maxLength={500} value={reason} onChange={e => setReason(e.target.value)} className="mt-2 min-h-24 w-full rounded-xl border border-border bg-background p-3" /></label>
            <p className="text-[13px] text-muted-foreground">Ожидаемая комиссия будет исключена из прогноза. Полученные деньги и история сохранятся. Возврат средств не выполняется. Задачи и показы остаются без изменений.</p>
          </div>
        </SheetFrame>
      </div>, document.body)}
      <PartnerAgreement key={d.id} deal={d} />
      <Group header="Участники">
        <Row
          leading={<Avatar name={c.name} size={30} />}
          title={c.name}
          subtitle="Клиент"
          onClick={() => s.push({ name: 'client', id: c.id })}
        />
        <Row
          icon={Building2}
          title={propertyTitle(p)}
          subtitle={`Объект · ${p.district}`}
          onClick={() => s.push({ name: 'property', id: p.id })}
        />
      </Group>

      <Group header="История">
        {d.history.map((h) => (
          <Row key={h.id} icon={Handshake} title={h.label} value={h.when} />
        ))}
      </Group>
      <div className="px-8">
        <p className="flex items-start gap-2 text-[12px] leading-snug text-muted-foreground">
          <IconTileMini />
          Договорённости по комиссии сохраняются в истории и не удаляются.
        </p>
      </div>
    </Screen>
  )
}

function IconTileMini() {
  return <span className="mt-1 size-1.5 shrink-0 rounded-full bg-muted-foreground/50" aria-hidden />
}
