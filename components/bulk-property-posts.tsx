'use client'

import { useRef, useState } from 'react'
import { type Property } from '@/lib/data'
import { parsePropertyPost, postUrl } from '@/lib/property-post'
import { useStore } from '@/lib/store'

const fingerprint = (text: string) => text.trim().replace(/\s+/g, ' ').toLowerCase()
function splitPosts(text: string) {
  const normalized = text.replace(/\\n/g, '\n').replace(/\\r/g, '\r')
  return normalized.split(/^\s*---+\s*$/m).map(part => part.trim()).filter(Boolean).map(part => {
    const links = part.match(/https:\/\/[^\s<>]+/g) ?? []
    const urls = [...new Set(links.map(postUrl).filter((value): value is string => !!value))]
    const body = part.split('\n').filter(line => !postUrl(line.trim())).join('\n').trim()
    return { text: body, url: urls[0], ambiguous: urls.length > 1, fields: parsePropertyPost(body) }
  })
}

export function BulkPropertyPosts() {
  const store = useStore()
  const [text, setText] = useState('')
  const [rows, setRows] = useState<ReturnType<typeof splitPosts>>([])
  const [selected, setSelected] = useState<number[]>([])
  const [reviewed, setReviewed] = useState(false)
  const [error, setError] = useState('')
  const [created, setCreated] = useState<string[]>([])
  const saving = useRef(false)
  const button = 'min-h-11 rounded-xl border border-border px-3 py-2 text-sm font-medium disabled:opacity-40'
  const seenUrls = new Set(store.properties.flatMap(p => p.sourcePost?.url ? [postUrl(p.sourcePost.url) ?? p.sourcePost.url] : []))
  const seenTexts = new Set(store.properties.flatMap(p => p.sourcePost?.text ? [fingerprint(p.sourcePost.text)] : []))
  const checkedRows = rows.map(row => {
    const key = fingerprint(row.text)
    const reason = !row.text ? 'Нет текста объявления' : row.ambiguous ? 'Несколько постов в одном блоке — разделите их' : (row.url && seenUrls.has(row.url)) || seenTexts.has(key) ? 'Повтор ссылки или текста' : ''
    if (!reason) { if (row.url) seenUrls.add(row.url); seenTexts.add(key) }
    return { ...row, reason }
  })
  const available = checkedRows.filter((row, i) => !row.reason && selected.includes(i))
  return <details className="rounded-2xl border border-border bg-card p-4"><summary className="cursor-pointer py-2 font-semibold">Массовый импорт постов</summary>
    <p className="mt-3 text-sm text-muted-foreground">До 30 объявлений за раз. Между постами поставьте --- на отдельной строке. Ссылку можно вставить отдельной строкой рядом с текстом.</p>
    <p className="mt-2 text-xs text-muted-foreground">Только скопированный текст: каналы и фото не загружаются. Сохранение — в текущую демо-сессию. Каждый объект останется черновиком до ручной проверки.</p>
    {created.length ? <div className="mt-4 space-y-3"><p role="status" className="font-medium">Добавлено черновиков: {created.length}</p><p className="text-sm text-muted-foreground">Уточните тип объекта, район, адрес, цену и собственника. Черновики не участвуют в автоматическом подборе.</p><button type="button" className={button} onClick={() => { store.closeAllSheets(); store.setTab('properties'); store.push({ name: 'property', id: created[0] }) }}>Проверить первый объект</button><button type="button" className={button} onClick={() => { setText(''); setRows([]); setSelected([]); setCreated([]); setReviewed(false); saving.current = false }}>Следующая партия</button></div> : <>
      <label className="mt-4 block text-sm">Посты для импорта<textarea rows={8} maxLength={100000} value={text} onChange={e => { setText(e.target.value); setRows([]); setSelected([]); setReviewed(false); setError('') }} className="mt-2 w-full rounded-xl border border-border bg-background p-3 text-base" placeholder={'Продаётся 2-комнатная квартира. 65 м². 85 000 USD.\nhttps://t.me/channel/123\n---\nСдаётся 1-комнатная квартира. 40 м². 500 USD.'} /></label>
      <button type="button" className={`${button} mt-3`} disabled={!text.trim()} onClick={() => { const parsed = splitPosts(text); if (parsed.length > 30) { setError('Не больше 30 постов за один импорт. Разделите партию.'); return } setRows(parsed); setSelected(parsed.map((_, i) => i)); setReviewed(false); setError('') }}>Разобрать партию</button>
      {rows.length > 0 && <div className="mt-4 space-y-3"><h3 className="font-medium">Выбрано {available.length} из {rows.length}</h3><p className="text-xs text-muted-foreground">Цена распознаётся только в USD. Тип объекта и неизвестные поля требуют проверки; пустые значения не считаются подтверждёнными.</p>{checkedRows.map((row, i) => <article key={i} className="rounded-xl border border-border p-3"><label className="flex items-start gap-3"><input type="checkbox" className="mt-1 size-5 shrink-0" disabled={!!row.reason} checked={!row.reason && selected.includes(i)} onChange={e => { setSelected(current => e.target.checked ? [...current, i] : current.filter(n => n !== i)); setReviewed(false) }} /><span className="min-w-0 text-sm"><strong>Объявление {i + 1}</strong><span className="mt-1 block">{row.fields.op === 'sale' ? 'Продажа' : row.fields.op === 'rent' ? 'Аренда' : 'Сделка не определена'} · {row.fields.district ?? 'Район не определён'}</span><span className="block">{row.fields.rooms ?? '—'} комн. · {row.fields.area ?? '—'} м² · {row.fields.price ?? '—'} USD</span></span></label>{row.reason && <p className="mt-2 text-sm text-destructive">{row.reason} — пропущено</p>}<details className="mt-2"><summary className="cursor-pointer py-2 text-sm text-muted-foreground">Исходный пост</summary><p className="whitespace-pre-wrap break-words text-sm">{row.text}</p>{row.url && <p className="mt-2 break-all text-xs text-muted-foreground">{row.url}</p>}</details></article>)}
      <label className="flex items-start gap-3 text-sm"><input type="checkbox" className="mt-1 size-5 shrink-0" checked={reviewed} onChange={e => setReviewed(e.target.checked)} />Проверил разделение постов. Добавить выбранные как черновики.</label>
      <button type="button" disabled={!reviewed || !available.length} className="min-h-11 w-full rounded-xl bg-primary p-3 font-medium text-primary-foreground disabled:opacity-40" onClick={() => {
        if (saving.current || !reviewed || !available.length) return
        saving.current = true
        const objects: Property[] = available.map(row => ({ id: crypto.randomUUID(), op: row.fields.op ?? 'sale', kind: 'Квартира', district: row.fields.district ?? 'Не указан', address: 'Не указан', rooms: row.fields.rooms ?? 0, area: row.fields.area, price: row.fields.price ?? 0, freshness: 'new', checked: 'Не проверен', images: [], owner: 'Не указан', priceHistory: [], docs: [], draft: true, sourcePost: { text: row.text, url: row.url } }))
        store.setProperties(current => [...objects, ...current])
        setCreated(objects.map(p => p.id)); setReviewed(false)
      }}>Добавить черновики · {available.length}</button></div>}
      {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
    </>}
  </details>
}
