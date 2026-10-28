'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, ShieldCheck, UserPlus } from 'lucide-react'

type Role = 'agent' | 'manager' | 'finance'
type Member = { id: number; name: string; email: string; role: Role; state: 'active' | 'invited' | 'revoked'; clients: number }
const roles: Record<Role, { title: string; scope: string; phones: string; fees: string }> = {
  agent: { title: 'Агент', scope: 'Только назначенные клиенты и объекты', phones: 'Только свои клиенты и собственники', fees: 'Только свои комиссии' },
  manager: { title: 'Руководитель', scope: 'Все клиенты и объекты команды', phones: 'Все контакты команды', fees: 'Все комиссии команды' },
  finance: { title: 'Финансы', scope: 'Только финансовые сведения по сделкам', phones: 'Скрыты', fees: 'Все комиссии команды' },
}
const initial: Member[] = [
  { id: 1, name: 'Азиза Каримова', email: 'aziza@example.com', role: 'agent', state: 'active', clients: 8 },
  { id: 2, name: 'Тимур Алиев', email: 'timur@example.com', role: 'manager', state: 'active', clients: 3 },
  { id: 3, name: 'Бухгалтер', email: 'finance@example.com', role: 'finance', state: 'invited', clients: 0 },
]
const control = 'min-h-11 rounded-xl border border-neutral-300 px-4 py-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black'
function Permissions({ role }: { role: Role }) {
  const rights = roles[role]
  return <dl className="mt-4 space-y-3 rounded-2xl bg-neutral-100 p-4 text-sm">{[['База', rights.scope], ['Телефоны', rights.phones], ['Комиссии', rights.fees], ['Экспорт и доступы', 'Запрещены. Только владелец управляет доступами.']].map(([label, value]) => <div key={label}><dt className="font-medium">{label}</dt><dd className="mt-1 leading-5 text-neutral-600">{value}</dd></div>)}</dl>
}

export function TeamAccess() {
  const [members, setMembers] = useState(initial)
  const [editing, setEditing] = useState<number | 'new' | null>(null)
  const [role, setRole] = useState<Role>('agent')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [revoke, setRevoke] = useState<number | null>(null)
  const [assignee, setAssignee] = useState('owner')
  const [events, setEvents] = useState<string[]>([])
  const target = members.find(m => m.id === revoke)
  function record(text: string) { setMessage(text); setEvents(prev => [text, ...prev]) }
  function open(id: number | 'new') { const member = members.find(m => m.id === id); setEditing(id); setRole(member?.role ?? 'agent'); setEmail(member?.email ?? ''); setRevoke(null); setMessage('') }
  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalized = email.trim().toLowerCase()
    if (editing === 'new') {
      if (members.some(m => m.email.toLowerCase() === normalized && m.state !== 'revoked')) { setMessage('Этот email уже есть в команде или приглашениях.'); return }
      setMembers(prev => [...prev, { id: Date.now(), name: normalized, email: normalized, role, state: 'invited', clients: 0 }])
      record(`Демо: приглашение ${normalized} подготовлено. Письмо не отправлено.`)
    } else {
      const member = members.find(m => m.id === editing)
      if (member && role === 'finance' && member.clients > 0) { setMessage('Сначала передайте клиентов: роль «Финансы» не предусматривает работу с клиентской базой. В этом демо передача доступна при отзыве доступа.'); return }
      setMembers(prev => prev.map(m => m.id === editing ? { ...m, role } : m))
      record(`Демо: роль ${member?.name} изменена на «${roles[role].title}».`)
    }
    setEditing(null)
  }
  function confirmRevoke() {
    if (!target) return
    const recipient = assignee === 'owner' ? 'владельцу' : members.find(m => String(m.id) === assignee)?.name
    setMembers(prev => prev.map(m => m.id === target.id ? { ...m, state: 'revoked', clients: 0 } : String(m.id) === assignee ? { ...m, clients: m.clients + target.clients } : m))
    record(target.state === 'invited' ? `Демо: приглашение ${target.email} отменено.` : `Демо: доступ ${target.name} отозван. Клиентов передано ${recipient}: ${target.clients}.`)
    setRevoke(null)
  }
  return <main className="min-h-dvh bg-[#faf9f6] text-neutral-950"><div className="mx-auto max-w-3xl px-5 pb-12 sm:px-8">
    <header className="flex items-center justify-between gap-3 border-b border-neutral-200 py-5"><Link className="flex min-h-11 items-center gap-2 text-sm" href="/start"><ArrowLeft size={16} aria-hidden="true" />К режимам</Link><span className="text-sm font-semibold">SuperApp / команда</span></header>
    <p className="mt-7 text-xs uppercase tracking-[.16em] text-neutral-500">Контроль доступа</p><h1 className="mt-3 text-4xl font-semibold tracking-tight">Своя роль.<br />Понятные границы.</h1><p className="mt-4 text-sm leading-6 text-neutral-600">Кто видит базу, телефоны и деньги — без догадок и случайного доступа.</p>
    <aside className="mt-5 border-l-2 border-neutral-400 pl-3 text-xs leading-5 text-neutral-600">Демо на вымышленных сотрудниках. Изменения действуют только на этом экране до перезагрузки. Письма не отправляются, реальные права и сессии не меняются.</aside>
    <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5"><div className="flex items-center gap-3"><ShieldCheck size={22} aria-hidden="true" /><div><h2 className="font-semibold">Вы — владелец</h2><p className="mt-1 text-sm text-neutral-600">Полный доступ · роль защищена от удаления</p></div></div><p className="mt-3 text-xs leading-5 text-neutral-500">Управление сотрудниками и экспорт базы доступны только владельцу. Владелец не отображается среди получателей отзыва.</p></section>
    <div className="mt-8 flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold">Сотрудники и приглашения</h2><button className={`${control} flex items-center gap-2 bg-neutral-950 text-white`} onClick={() => open('new')}><UserPlus size={16} aria-hidden="true" />Пригласить</button></div>
    {editing !== null && <section className="mt-4 rounded-2xl border border-neutral-400 bg-white p-5" aria-label="Настройка доступа"><h3 className="text-lg font-semibold">{editing === 'new' ? 'Новое приглашение' : 'Изменить роль'}</h3><form onSubmit={save} className="mt-4"><label className="block text-sm">Email<input autoFocus required type="email" maxLength={254} readOnly={editing !== 'new'} value={email} onChange={e => setEmail(e.target.value)} className={`${control} mt-2 w-full`} /></label><label className="mt-4 block text-sm">Роль<select value={role} onChange={e => setRole(e.target.value as Role)} className={`${control} mt-2 w-full`}>{Object.entries(roles).map(([key, r]) => <option key={key} value={key}>{r.title}</option>)}</select></label><Permissions role={role} />{role !== 'agent' && <p className="mt-3 text-sm font-medium">Обратите внимание: эта роль раскрывает комиссии всей команды.</p>}<p className="mt-3 text-xs leading-5 text-neutral-500">Приглашённый сотрудник не получает доступ до принятия приглашения. В этом демо принятие не реализовано.</p><div className="mt-4 flex flex-wrap gap-2"><button className={`${control} bg-neutral-950 text-white`} type="submit">{editing === 'new' ? 'Подготовить приглашение' : 'Подтвердить роль'}</button><button className={control} type="button" onClick={() => setEditing(null)}>Отмена</button></div></form></section>}
    <p role="status" className="my-4 text-sm leading-6">{message}</p>
    <div className="space-y-4">{members.map(m => <article key={m.id} className="rounded-2xl border border-neutral-200 bg-white p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><h3 className="break-words font-semibold">{m.name}</h3><p className="mt-1 break-all text-xs text-neutral-500">{m.email}</p></div><span className="rounded-full bg-neutral-100 px-3 py-1 text-xs">{m.state === 'active' ? 'Активен' : m.state === 'invited' ? 'Ожидает принятия' : 'Доступ отозван'}</span></div><p className="mt-4 text-sm">{roles[m.role].title} · назначено клиентов: {m.clients}</p>{m.state !== 'revoked' && <><details className="mt-3"><summary className="min-h-11 cursor-pointer py-3 text-sm underline underline-offset-4">{m.state === 'invited' ? 'Права после принятия' : 'Что доступно'}</summary><Permissions role={m.role} /></details><div className="mt-2 flex flex-wrap gap-2"><button className={control} onClick={() => open(m.id)} aria-label={`Изменить роль: ${m.name}`}>Изменить роль</button><button className={control} onClick={() => { setRevoke(m.id); setAssignee('owner'); setEditing(null) }} aria-label={`Отозвать доступ: ${m.name}`}>{m.state === 'invited' ? 'Отменить приглашение' : 'Отозвать доступ'}</button></div></>}
      {revoke === m.id && <section aria-label="Подтверждение отзыва" className="mt-4 rounded-xl border border-neutral-400 p-4"><h4 className="font-semibold">{m.state === 'invited' ? 'Отменить приглашение?' : 'Отозвать доступ и передать клиентов?'}</h4><p className="mt-2 text-sm leading-6 text-neutral-600">Записи и история не удаляются. Уже скопированные или скачанные данные отозвать невозможно.</p>{m.clients > 0 && <label className="mt-3 block text-sm">Передать {m.clients} клиентов<select className={`${control} mt-2 w-full`} value={assignee} onChange={e => setAssignee(e.target.value)}><option value="owner">Владельцу (вам)</option>{members.filter(x => x.id !== m.id && x.state === 'active' && x.role !== 'finance').map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>}<div className="mt-4 flex flex-wrap gap-2"><button className={`${control} bg-neutral-950 text-white`} onClick={confirmRevoke}>Подтвердить отзыв</button><button className={control} onClick={() => setRevoke(null)}>Не отзывать</button></div></section>}
    </article>)}</div>
    <section className="mt-8"><h2 className="text-xl font-semibold">История изменений</h2><p className="mt-2 text-xs leading-5 text-neutral-500">Локальная история демо, не защищённый журнал аудита.</p>{events.length ? <ol className="mt-4 divide-y divide-neutral-200">{events.map((event, i) => <li className="py-4 text-sm leading-6" key={i}>{event}</li>)}</ol> : <p className="mt-4 text-sm text-neutral-600">Изменений в этой сессии пока нет.</p>}</section>
  </div></main>
}
