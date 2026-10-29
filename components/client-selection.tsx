'use client'

import { useState } from 'react'
import { type Property, money, propertyTitle } from '@/lib/data'

export function ClientSelection({ properties }: { properties: Property[] }) {
  const [selected, setSelected] = useState<string[]>([])
  const [text, setText] = useState('')
  const [message, setMessage] = useState('')
  const chosen = properties.filter(p => selected.includes(p.id))
  const button = 'min-h-11 rounded-xl border border-border px-4 py-2 text-sm font-medium disabled:opacity-40'
  return <section className="mx-4 mb-6 rounded-2xl border border-border bg-card p-4" aria-label="Редактор подборки">
    <h2 className="font-semibold">Подборка для клиента</h2>
    <p className="mt-2 text-sm text-muted-foreground">Выберите варианты из совпадений, подготовьте и отредактируйте текст. Это демо: выбор и текст не сохраняются после закрытия карточки. Отправка — вручную.</p>
    <fieldset className="mt-4 space-y-2"><legend className="sr-only">Объекты для подборки</legend>{properties.map(p => <label key={p.id} className="flex min-h-11 items-start gap-3 rounded-xl border border-border p-3"><input type="checkbox" className="mt-1 size-5 shrink-0" checked={selected.includes(p.id)} onChange={e => { setSelected(current => e.target.checked ? [...current, p.id] : current.filter(id => id !== p.id)); setText(''); setMessage('') }} /><span className="min-w-0 text-sm"><span className="block font-medium">{propertyTitle(p)} · {money(p.price, p.op)}</span><span className="block text-muted-foreground">{p.address} · {p.district}</span>{p.freshness === 'recheck' && <span className="block text-amber-700">Перед отправкой перепроверьте доступность</span>}</span></label>)}</fieldset>
    {!properties.length && <p className="mt-3 text-sm">Нет подходящих объектов. Уточните запрос клиента.</p>}
    <button className={`${button} mt-4`} disabled={!chosen.length} onClick={() => { setText(`Предлагаю рассмотреть ${chosen.length} варианта:\n\n${chosen.map((p, i) => `${i + 1}. ${propertyTitle(p)}\n${p.district}, ${p.address}\n${money(p.price, p.op)}${p.area ? ` · ${p.area} м²` : ''}${p.freshness === 'recheck' ? '\nДоступность требует подтверждения.' : ''}`).join('\n\n')}\n\nКакие варианты вам интересны? Уточним доступность и согласуем показ.`); setMessage('Черновик подготовлен. Ничего не отправлено.') }}>Подготовить текст · {chosen.length}</button>
    {text && <div className="mt-4"><label className="grid gap-2 text-sm">Текст для клиента<textarea rows={10} value={text} onChange={e => { setText(e.target.value); setMessage('') }} className="w-full rounded-xl border border-border bg-background p-3" /></label><button className={`${button} mt-3`} onClick={async () => { try { await navigator.clipboard.writeText(text); setMessage('Текст скопирован. Отправьте его клиенту самостоятельно.') } catch { setMessage('Копирование недоступно. Выделите и скопируйте текст вручную.') } }}>Скопировать</button></div>}
    <p role="status" className="mt-3 text-sm text-muted-foreground">{message}</p>
  </section>
}
