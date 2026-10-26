'use client'

import { useState } from 'react'

type Home = { id: string; district: string; rooms: number; area: number; price: number }

export function ShortlistFollowUp({ homes }: { homes: Home[] }) {
  const [date, setDate] = useState('')
  const [note, setNote] = useState('Обсудить подборку и согласовать показ')
  const [task, setTask] = useState<{ date: string; note: string; homes: Home[] } | null>(null)
  const [feedback, setFeedback] = useState('')
  const message = `Здравствуйте! Подготовил варианты для обсуждения:\n${homes.map(home => `${home.district}, ${home.rooms} комн., ${home.area} м² — ${new Intl.NumberFormat('ru-RU').format(home.price)} USD`).join('\n')}\nКакие варианты вам интересны?\n\nДемо: все объекты вымышленные.`
  async function copy() {
    try { await navigator.clipboard.writeText(message); setFeedback('Демо-текст скопирован. Сообщение не отправлено.') }
    catch { setFeedback('Не удалось скопировать. Выделите текст вручную.') }
  }
  return <section className="space-y-4 rounded-3xl border border-neutral-200 p-5" aria-label="Следующий контакт по подборке">
    <div><p className="text-xs uppercase tracking-widest text-neutral-500">Следующий шаг / Демо</p><h3 className="mt-2 text-xl font-semibold">Обсудите варианты</h3><p className="mt-2 text-sm text-neutral-600">Нет реального клиента, отправки и уведомлений. Задача сбрасывается при очистке подборки или выходе из сценария.</p></div>
    <label className="block text-sm">Черновик сообщения<textarea readOnly value={message} className="mt-2 min-h-48 w-full rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-base" /></label>
    <button type="button" onClick={copy} className="min-h-12 rounded-xl border border-neutral-300 px-4 text-sm">Скопировать демо-сообщение</button>
    <p role="status" className="text-sm text-neutral-600">{feedback}</p>
    {task ? <div className="space-y-3 rounded-2xl bg-neutral-50 p-4"><h4 className="font-semibold">Демо-задача назначена</h4><p className="text-sm">{task.note}</p><p className="text-sm">{task.date.split('-').reverse().join('.')} · дата в Asia/Tashkent</p><ul className="space-y-1 text-sm">{task.homes.map(home => <li key={home.id}>Объект {home.id.toUpperCase()} · {home.district} · {home.area} м²</li>)}</ul><p className="text-xs text-neutral-500">Состав зафиксирован при назначении. Изменение подборки не меняет эту задачу.</p><button type="button" className="min-h-11 underline" onClick={() => setTask(null)}>Отменить демо-задачу</button></div> : <form className="space-y-4" onSubmit={event => { event.preventDefault(); setTask({ date, note: note.trim(), homes: [...homes] }) }}>
      <label className="block text-sm">Дата следующего контакта<input required type="date" value={date} onChange={event => setDate(event.target.value)} className="mt-2 min-h-12 w-full min-w-0 rounded-xl border border-neutral-200 bg-white px-3 text-base" /></label>
      <label className="block text-sm">Что сделать<input required maxLength={200} value={note} onChange={event => setNote(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-neutral-200 px-3 text-base" /></label>
      <button disabled={!date || !note.trim()} className="min-h-12 w-full rounded-xl bg-black px-4 text-sm font-medium text-white disabled:opacity-40">Назначить демо-контакт</button>
    </form>}
  </section>
}
