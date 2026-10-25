import type { Task, Showing } from './data'
import { clockLabel, dayLabel, taskBucket } from './dates'

export function clientNext(clientId: string, tasks: Task[], showings: Showing[], now: Date) {
  const actions = [
    ...tasks.filter(t => t.clientId === clientId && !t.done).map(t => ({ id: t.id, title: t.title, at: t.dueAt, source: 'task' as const, kind: t.kind })),
    ...showings.filter(s => s.clientId === clientId && (s.status === 'pending' || s.status === 'confirmed')).map(s => ({ id: s.id, title: s.status === 'pending' ? 'Подтвердить показ' : 'Провести показ', at: s.startsAt, source: 'showing' as const, kind: 'showing' as const })),
  ].filter(a => Number.isFinite(Date.parse(a.at))).sort((a, b) => Date.parse(a.at) - Date.parse(b.at) || a.id.localeCompare(b.id))
  const first = actions[0]
  return first ? { ...first, bucket: taskBucket(first.at, now), time: `${dayLabel(first.at, now)}, ${clockLabel(first.at)}` } : undefined
}
