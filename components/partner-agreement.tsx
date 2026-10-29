'use client'

import { useState } from 'react'
import { type Deal, money } from '@/lib/data'
import { useStore } from '@/lib/store'

export function PartnerAgreement({ deal }: { deal: Deal }) {
  const store = useStore()
  const [name, setName] = useState(deal.partnerDraft?.name ?? '')
  const [share, setShare] = useState(String(deal.partnerDraft?.share ?? 40))
  const [scope, setScope] = useState(deal.partnerDraft?.scope ?? '')
  const [access, setAccess] = useState(deal.partnerDraft?.access ?? 'Контакт не передаётся')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const percent = Number(share)
  const valid = share.trim() !== '' && Number.isInteger(percent) && percent > 0 && percent < 100
  const part = valid ? Math.round(deal.commission.amount * 100 * percent / 100) / 100 : 0
  const field = 'mt-2 min-h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-base'
  return <section className="mx-4 mb-6 rounded-2xl bg-card p-4" aria-labelledby="partner-title">
    <h2 id="partner-title" className="text-lg font-semibold">Партнёрская договорённость</h2>
    <p className="mt-2 text-sm text-muted-foreground">Черновик для обсуждения. Не меняет распределение выше, не подтверждает согласие партнёра и не означает выплату. Сохраняется только в текущей демо-сессии.</p>
    <form className="mt-4 space-y-4" onChange={() => { setSaved(false); setError('') }} onSubmit={e => {
      e.preventDefault()
      if (!name.trim() || !scope.trim() || !valid) { setError('Укажите партнёра, обязанности и целую долю от 1 до 99%.'); return }
      if (deal.cancellation) { setError('Сделка отменена. Новые договорённости недоступны.'); return }
      const at = new Date().toISOString()
      store.updateDeal(deal.id, current => ({ ...current, partnerDraft: { name: name.trim(), share: percent, scope: scope.trim(), access }, history: [{ id: crypto.randomUUID(), label: `Черновик партнёрства: ${name.trim()}, ${percent}%. Обязанности: ${scope.trim()}. ${access}. Распределение и оплаты не изменены.`, when: new Date(at).toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent' }) + ' · Ташкент' }, ...current.history] }))
      setSaved(true)
    }}>
      <label className="block text-sm">Партнёр<input required maxLength={100} value={name} onChange={e => setName(e.target.value)} className={field} /></label>
      <label className="block text-sm">За что отвечает партнёр<textarea required maxLength={500} rows={3} value={scope} onChange={e => setScope(e.target.value)} className={field} placeholder="Например, организует показы и собирает обратную связь" /></label>
      <label className="block text-sm">Доля партнёра от общей комиссии, %<input required type="number" min={1} max={99} step={1} value={share} onChange={e => setShare(e.target.value)} className={field} /></label>
      {valid && <div className="rounded-xl bg-secondary p-3 text-sm"><p>Партнёру: {money(part)}</p><p>Остальным участникам: {money(deal.commission.amount - part)}</p><p className="mt-2 text-muted-foreground">Расчёт от ожидаемой комиссии, не от полученной. Остаток не распределён между участниками; существующие доли не заменяются автоматически.</p></div>}
      <label className="block text-sm">Условие передачи контакта<select value={access} onChange={e => setAccess(e.target.value)} className={field}><option>Контакт не передаётся</option><option>После согласия клиента — вручную</option></select></label>
      <p className="text-sm text-muted-foreground">Телефон, имя клиента и адрес объекта не включаются в этот черновик. Изменение условия не открывает партнёру доступ к базе.</p>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <button disabled={!!deal.cancellation || saved} className="min-h-11 w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">{saved ? 'Черновик записан в демо' : 'Записать черновик в демо'}</button>
      <p role="status" className="text-sm text-muted-foreground">{saved ? 'Условия добавлены в историю сделки. Партнёру ничего не отправлено.' : deal.cancellation ? 'Сделка отменена — редактирование недоступно.' : ''}</p>
    </form>
  </section>
}
