'use client'

import { Group, Row, Button } from '@/components/ios/primitives'
import { useStore } from '@/lib/store'

const statuses: Record<string, string> = { scheduled: 'Назначен', pending: 'Ожидает подтверждения', confirmed: 'Подтверждён', done: 'Завершён', moved: 'Перенесён', cancelled: 'Отменён', noshow: 'Не состоялся' }
const formatDate = (value: string) => new Intl.DateTimeFormat('ru-RU', { timeZone: 'Asia/Tashkent', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value))

export function PropertyActivity({ propertyId, active }: { propertyId: string; active: boolean }) {
  const s = useStore()
  const showings = s.showings.filter((item) => item.propertyId === propertyId).sort((a, b) => a.startsAt.localeCompare(b.startsAt))
  const upcoming = showings.filter((item) => ['scheduled', 'pending', 'confirmed'].includes(item.status))
  const history = showings.filter((item) => !['scheduled', 'pending', 'confirmed'].includes(item.status)).reverse()
  const tasks = s.tasks.filter((item) => item.propertyId === propertyId && !item.done).sort((a, b) => a.dueAt.localeCompare(b.dueAt))
  return <>
    <Group header="Ближайшие действия" footer="Время Ташкента · изменения сохраняются только до перезагрузки демо.">
      {upcoming.length === 0 && tasks.length === 0 && <Row title="Следующий шаг не назначен" subtitle="Запланируйте показ или задачу по объекту" />}
      {upcoming.map((item) => <Row key={item.id} title={`Показ · ${s.clients.find((client) => client.id === item.clientId)?.name ?? 'Клиент не найден'}`} subtitle={`${formatDate(item.startsAt)} · ${statuses[item.status]}${Date.parse(item.startsAt) < s.now.getTime() ? ' · время прошло, уточните результат' : ''}`} onClick={() => s.openSheet({ type: 'outcome', showingId: item.id })} />)}
      {tasks.map((item) => <Row key={item.id} title={item.title} subtitle={`${formatDate(item.dueAt)}${item.bucket === 'overdue' ? ' · просрочена' : ''}`} onClick={() => s.push({ name: 'tasks' })} />)}
      <div className="flex flex-wrap gap-2 p-4">
        <Button size="sm" variant="secondary" onClick={() => s.openSheet({ type: 'addTask', propertyId })}>Добавить задачу</Button>
        {active && <Button size="sm" onClick={() => s.openSheet({ type: 'addShowing', propertyId })}>Назначить показ</Button>}
      </div>
    </Group>
    {history.length > 0 && <Group header="История показов">{history.map((item) => <Row key={item.id} title={`${statuses[item.status]} · ${s.clients.find((client) => client.id === item.clientId)?.name ?? 'Клиент не найден'}`} subtitle={`${formatDate(item.startsAt)}${item.outcome ? ` · ${item.outcome}` : ''}`} />)}</Group>}
  </>
}
