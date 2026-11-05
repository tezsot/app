'use client'

import { useState } from 'react'
import { ArrowUp, ArrowDown, X } from 'lucide-react'
import { type Client, type Property, matchReasons, matchScore, money, propertyTitle } from '@/lib/data'
import { DealPropertyOption } from '@/components/deal-property-option'
import { Button, SearchField } from '@/components/ios/primitives'

export function ClientSelection({ properties, client }: { properties: Property[]; client: Client }) {
  const [selected, setSelected] = useState<string[]>([])
  const [query, setQuery] = useState('')
  const [text, setText] = useState('')
  const [generated, setGenerated] = useState('')
  const [snapshot, setSnapshot] = useState('')
  const [prepared, setPrepared] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [reviewed, setReviewed] = useState(false)
  const [message, setMessage] = useState('')
  const chosen = selected.flatMap(id => properties.filter(p => p.id === id))
  const signature = JSON.stringify(chosen.map(p => [p.id, p.price, p.freshness, p.rooms, p.area, p.district]))
  const stale = prepared && snapshot !== signature
  const dirty = text !== generated
  const filtered = properties.filter(p => `${propertyTitle(p)} ${p.district} ${p.address}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))
  const change = (ids: string[]) => { setSelected(ids); setReviewed(false); setConfirm(false); setMessage('') }
  const generate = () => {
    const next = `Предлагаю рассмотреть следующие варианты (${chosen.length}):\n\n${chosen.map((p, i) => `${i + 1}. ${propertyTitle(p)}\n${p.district}\n${money(p.price, p.op)}${p.area ? ` · ${p.area} м²` : ''}${p.freshness !== 'confirmed' ? '\nЦена и доступность требуют подтверждения.' : ''}`).join('\n\n')}\n\nКакие варианты вам интересны? Уточним доступность и согласуем показ.`
    setText(next); setGenerated(next); setSnapshot(signature); setPrepared(true); setReviewed(false); setConfirm(false); setMessage('Черновик готов. Ничего не отправлено.')
  }
  return <section className="mx-4 mb-6 flex flex-col gap-4 rounded-[24px] border border-border bg-card p-4" aria-label="Редактор подборки">
    <div><h2 className="font-semibold">Подборка для {client.name.split(' ')[0]}</h2><p className="mt-1 text-sm text-muted-foreground">Выберите варианты, расставьте по порядку и подготовьте сообщение.</p></div>
    <details className="rounded-2xl bg-secondary p-3"><summary className="cursor-pointer py-1 text-xs text-muted-foreground">Демо · отправка вручную</summary><p className="mt-2 text-xs leading-relaxed text-muted-foreground">Выбор и текст доступны до выхода из карточки. Фото не отправляются. Телефон и точный адрес не добавляются в шаблон. Процент — совпадение по правилам, не вероятность сделки.</p></details>
    <SearchField value={query} onChange={setQuery} placeholder="Найти в подходящих объектах" />
    <p role="status" className="text-xs text-muted-foreground">Найдено {filtered.length} · выбрано {chosen.length} из 5</p>
    {filtered.map(p => <div key={p.id} className="flex flex-col gap-2"><DealPropertyOption property={p} selected={selected.includes(p.id)} onClick={() => {
      if (selected.includes(p.id)) change(selected.filter(id => id !== p.id))
      else if (chosen.length < 5) change([...selected, p.id])
      else setMessage('В одной подборке до 5 объектов. Уберите один, чтобы добавить другой.')
    }} /><p className="px-2 text-xs text-muted-foreground">{matchScore(client, p)}% · {matchReasons(client, p).join(' · ')}</p>{p.freshness !== 'confirmed' && <p className="px-2 text-xs text-destructive">Уточните цену и доступность до отправки.</p>}</div>)}
    {!filtered.length && <p className="py-4 text-sm text-muted-foreground">{query ? 'Нет результатов. Попробуйте другой район или очистите поиск.' : 'Нет подходящих объектов. Уточните запрос клиента.'}</p>}
    {chosen.length > 0 && <div className="flex flex-col gap-2"><h3 className="text-sm font-medium">Порядок в сообщении</h3>{chosen.map((p, i) => <div key={p.id} className="flex items-center gap-1 rounded-2xl bg-secondary p-2"><span className="min-w-0 flex-1 pl-2 text-xs">{i + 1}. {propertyTitle(p)} · {p.district}</span>{[-1, 1].map(direction => <button key={direction} type="button" disabled={direction < 0 ? i === 0 : i === chosen.length - 1} aria-label={`${direction < 0 ? 'Поднять' : 'Опустить'} вариант ${i + 1}`} onClick={() => { const ids = chosen.map(p => p.id); [ids[i], ids[i + direction]] = [ids[i + direction], ids[i]]; change(ids) }} className="flex size-11 shrink-0 items-center justify-center rounded-xl disabled:opacity-30">{direction < 0 ? <ArrowUp className="size-4" /> : <ArrowDown className="size-4" />}</button>)}<button type="button" aria-label={`Убрать вариант ${i + 1}`} onClick={() => change(selected.filter(id => id !== p.id))} className="flex size-11 shrink-0 items-center justify-center rounded-xl"><X className="size-4" /></button></div>)}</div>}
    {stale && <p role="status" className="rounded-2xl bg-secondary p-3 text-sm">Состав, порядок или данные объектов изменились. Ваш текст сохранён. Обновите его перед копированием.</p>}
    <Button disabled={!chosen.length} onClick={() => prepared && dirty ? setConfirm(true) : generate()}>{prepared ? 'Обновить текст' : `Подготовить текст · ${chosen.length}`}</Button>
    {confirm && <div className="flex flex-col gap-3 rounded-2xl border border-border p-4"><p className="text-sm font-medium">Заменить ручные правки новым шаблоном?</p><Button onClick={generate}>Заменить текст</Button><Button variant="secondary" onClick={() => setConfirm(false)}>Оставить мой текст</Button></div>}
    {prepared && <div className="flex flex-col gap-3"><label className="flex flex-col gap-2 text-sm">Текст для клиента<textarea rows={10} maxLength={12000} value={text} onChange={e => { setText(e.target.value); setReviewed(false); setConfirm(false); setMessage('') }} className="w-full rounded-2xl border border-border bg-background p-3 text-base" /></label><label className="flex min-h-11 items-start gap-3 text-sm"><input type="checkbox" checked={reviewed} disabled={stale} onChange={e => setReviewed(e.target.checked)} className="mt-1 size-5 shrink-0 accent-primary" /><span>Проверил цены, доступность и текст перед отправкой.</span></label><Button disabled={stale || !reviewed || !text.trim() || !chosen.length} onClick={async () => { try { await navigator.clipboard.writeText(text); setMessage('Скопировано. Отправьте сообщение клиенту вручную.') } catch { setMessage('Копирование недоступно. Выделите текст и скопируйте вручную.') } }}>Скопировать сообщение</Button></div>}
    <p role="status" className="text-sm text-muted-foreground">{message}</p>
  </section>
}
