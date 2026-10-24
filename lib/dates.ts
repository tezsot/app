export const TIME_ZONE = 'Asia/Tashkent'

export function dateKey(value: string | Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value))
}

export function relativeDate(days = 0, time = '23:59', now: Date = new Date()): string {
  if (!Number.isInteger(days) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new Error('Некорректная дата')
  const day = new Date(`${dateKey(now)}T12:00:00+05:00`)
  day.setUTCDate(day.getUTCDate() + days)
  return new Date(`${dateKey(day)}T${time}:00+05:00`).toISOString()
}

export function dayOffset(value: string, now: Date = new Date()): number {
  return Math.round((Date.parse(`${dateKey(value)}T00:00:00Z`) - Date.parse(`${dateKey(now)}T00:00:00Z`)) / 86400000)
}

export function clockLabel(value: string): string {
  return new Intl.DateTimeFormat('ru-RU', { timeZone: TIME_ZONE, hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

export function dayLabel(value: string, now: Date = new Date()): string {
  const offset = dayOffset(value, now)
  if (offset === 0) return 'Сегодня'
  if (offset === 1) return 'Завтра'
  if (offset === -1) return 'Вчера'
  return new Intl.DateTimeFormat('ru-RU', { timeZone: TIME_ZONE, day: 'numeric', month: 'short' }).format(new Date(value))
}

export function taskBucket(value: string, now: Date = new Date()): 'overdue' | 'today' | 'later' {
  if (Date.parse(value) < now.getTime()) return 'overdue'
  return dayOffset(value, now) === 0 ? 'today' : 'later'
}
