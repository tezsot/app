import type { Deal } from './data'

export function cancelDeal(deal: Deal, reason: string, at: string, eventId: string): Deal {
  if (deal.cancellation || deal.stage >= 5) return deal
  const trimmed = reason.trim()
  if (!trimmed || trimmed.length > 500) throw new Error('Укажите причину отмены до 500 символов')
  return {
    ...deal,
    cancellation: { reason: trimmed, at },
    next: 'Сделка отменена',
    history: [{ id: eventId, label: `Сделка отменена: ${trimmed}`, when: new Intl.DateTimeFormat('ru-RU', { timeZone: 'Asia/Tashkent', dateStyle: 'short', timeStyle: 'short' }).format(new Date(at)) }, ...deal.history],
  }
}
