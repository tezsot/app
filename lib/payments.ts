export function parsePayment(value: string): number | null {
  const normalized = value.trim().replace(/\s/g, '').replace(',', '.')
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return null
  const cents = Math.round(Number(normalized) * 100)
  return Number.isSafeInteger(cents) && cents > 0 ? cents : null
}

export function applyPayment(amount: number, received: number, paymentCents: number) {
  const totalCents = Math.round(amount * 100)
  const receivedCents = Math.round(received * 100)
  if (![totalCents, receivedCents, paymentCents].every(Number.isSafeInteger) || receivedCents < 0 || paymentCents <= 0 || paymentCents > totalCents - receivedCents) throw new Error('Сумма должна быть положительной и не превышать остаток')
  const updated = receivedCents + paymentCents
  return { received: updated / 100, status: updated === totalCents ? 'paid' as const : 'partial' as const }
}
