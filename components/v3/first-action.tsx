'use client'

import { useState } from 'react'

type Draft = { budget: string; district: string; next: string; rooms: string }
export const initialDraft: Draft = { budget: '85000', district: 'Юнусабад', next: 'Уточнить удобное время показа', rooms: '2' }
const examples = [
  { district: 'Юнусабад', price: 82000, rooms: '2', detail: 'Балкон · состояние лифта нужно уточнить' },
  { district: 'Чиланзар', price: 74000, rooms: '2', detail: 'Тихий двор · ремонт нужно уточнить' },
  { district: 'Юнусабад', price: 96000, rooms: '3', detail: '3 комнаты · документы нужно уточнить' },
]

export function FirstAction({ kind, draft, onChange, onComplete }: { kind: number; draft: Draft; onChange: (draft: Draft) => void; onComplete: (text: string) => void }) {
  const [reviewed, setReviewed] = useState(false)
  const titles = ['Не держать обещания в голове.', 'Меньше ссылок. Больше совпадений.', 'Объявление начинается с фактов.', 'Помочь там, где нет следующего шага.']
  const field = 'mt-2 min-h-12 w-full rounded-xl border border-neutral-300 bg-white px-3 text-base'
  const valid = Number.isFinite(Number(draft.budget)) && Number(draft.budget) > 0
  const matches = examples.filter(item => item.district === draft.district && item.price <= Number(draft.budget) && item.rooms === draft.rooms)
  const change = (name: keyof Draft, value: string) => { onChange({ ...draft, [name]: value }); setReviewed(false) }
  const text = kind === 1 ? `Подбор: ${matches.length} совпадений. ${draft.district}, ${draft.rooms} комнаты, до $${draft.budget}.` : kind === 2 ? `Продаётся квартира: ${draft.rooms} комнаты, ${draft.district}. Цена — $${draft.budget}. Ремонт, площадь и документы нужно уточнить.` : kind === 3 ? 'Заявка Азизы: ответственный — демо-сотрудник Тимур. Пробел: не согласовано следующее действие.' : `Запрос Азизы: ${draft.rooms} комнаты, ${draft.district}, до $${draft.budget}.`
  return <div>
    <span className="rounded-full border border-neutral-300 px-3 py-1 text-xs">Вымышленные данные · не AI</span>
    <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-tight">{titles[kind]}</h1>
    <p className="mt-4 text-sm leading-relaxed text-neutral-600">{kind === 3 ? 'В примере нет следующей задачи. Предложите действие для сотрудника — без назначения реальных прав.' : 'Измените условия примера и посмотрите результат. Мы не анализируем сообщения и не обращаемся к реальной базе.'}</p>
    <div className="my-6 space-y-4 rounded-3xl border border-neutral-200 bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">Азиза · демо-запрос</p>
      {kind !== 3 && <><label className="block text-sm">Район<select value={draft.district} onChange={e => change('district', e.target.value)} className={field}><option>Юнусабад</option><option>Чиланзар</option></select></label><label className="block text-sm">Комнаты<select className={field} value={draft.rooms} onChange={e => change('rooms', e.target.value)}><option value="2">2 комнаты</option><option value="3">3 комнаты</option></select></label><label className="block text-sm">{kind === 2 ? 'Цена, USD' : 'Бюджет до, USD'}<input type="number" min="1" max="100000000" value={draft.budget} onChange={e => change('budget', e.target.value)} className={field} /></label>{!valid && <p role="alert" className="text-sm text-red-700">Укажите положительную сумму.</p>}</>}
      <div aria-live="polite" className="rounded-2xl bg-neutral-100 p-4 text-sm leading-relaxed"><p>{text}</p>{kind === 1 && <ul className="mt-3 space-y-2">{matches.map(item => <li key={item.price}>${item.price.toLocaleString('en-US')} · {item.detail}</li>)}{matches.length === 0 && <li>Точных совпадений нет. Попробуйте другой район или бюджет; условия сами не изменятся.</li>}</ul>}</div>
      <label className="block text-sm">Следующее действие<input maxLength={200} className={field} value={draft.next} onChange={e => change('next', e.target.value)} /></label>
      <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" checked={reviewed} onChange={e => setReviewed(e.target.checked)} className="size-5 accent-emerald-800" />Проверил пример и следующий шаг</label>
    </div>
    <button disabled={!reviewed || !draft.next.trim() || (kind !== 3 && !valid)} onClick={() => onComplete(`${text}\nСледующий шаг: ${draft.next.trim()}`)} className="min-h-14 w-full rounded-2xl bg-neutral-950 px-5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40">Продолжить с этим результатом</button>
    <p className="mt-3 text-xs leading-relaxed text-neutral-500">Ничего не отправится клиенту или сотруднику. Пример хранится только в открытой странице.</p>
  </div>
}
