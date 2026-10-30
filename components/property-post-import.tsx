'use client'
import { useState } from 'react'
import { parsePropertyPost, postUrl, type PostFields } from '@/lib/property-post'
import { type Property } from '@/lib/data'

export function PropertyPostImport({ properties, onApply }: { properties: Property[]; onApply: (fields: PostFields, source: NonNullable<Property['sourcePost']>) => void }) {
  const [text, setText] = useState('')
  const [url, setUrl] = useState('')
  const [fields, setFields] = useState<PostFields | null>(null)
  const [reviewed, setReviewed] = useState(false)
  const [message, setMessage] = useState('')
  const normalized = url.trim() ? postUrl(url) : undefined
  const duplicate = normalized && properties.find(p => p.sourcePost?.url === normalized)
  const labels = { op: 'Сделка', district: 'Район', rooms: 'Комнат', area: 'Площадь, м²', price: 'Цена, USD' }
  const input = 'mt-2 w-full rounded-xl border border-border bg-background p-3 text-base'
  return <details className="rounded-2xl border border-border bg-card p-4"><summary className="cursor-pointer py-2 font-semibold">Из Telegram / Instagram</summary>
    <p className="mt-3 text-sm text-muted-foreground">Скопируйте текст одного объявления. Ссылка сохраняется как источник, но не загружается. Фото и закрытые публикации автоматически не импортируются.</p>
    <label className="mt-3 block text-sm">Ссылка на пост · необязательно<input type="url" value={url} maxLength={500} className={input} placeholder="https://t.me/channel/123" onChange={e => { setUrl(e.target.value); setReviewed(false); setMessage('') }} /></label>
    {url.trim() && !normalized && <p role="alert" className="mt-2 text-sm text-destructive">Нужна HTTPS-ссылка на публичный пост t.me/канал/номер или instagram.com/p/код (либо /reel/код).</p>}
    {duplicate && <p role="alert" className="mt-2 text-sm text-destructive">Этот пост уже есть в базе: {duplicate.district}, {duplicate.address}. Повторный импорт по этой ссылке недоступен.</p>}
    <label className="mt-3 block text-sm">Текст поста<textarea rows={6} maxLength={10000} value={text} className={input} placeholder="Продаётся 2-комнатная квартира. Юнусабад. 65 м². Цена 85 000 USD." onChange={e => { setText(e.target.value); setFields(null); setReviewed(false); setMessage('') }} /></label>
    <button type="button" disabled={!text.trim() || !!duplicate || (!!url.trim() && !normalized)} className="mt-3 min-h-11 rounded-xl border border-border px-4 text-sm font-medium disabled:opacity-40" onClick={() => { setFields(parsePropertyPost(text)); setReviewed(false); setMessage('') }}>Распознать характеристики</button>
    {fields && <div className="mt-4 space-y-3"><h3 className="font-medium">Проверьте перед переносом</h3><dl className="space-y-2">{Object.entries(labels).map(([key, label]) => { const value = fields[key as keyof PostFields]; return <div key={key} className="flex justify-between gap-4 text-sm"><dt className="text-muted-foreground">{label}</dt><dd className="text-right">{value === undefined ? 'Уточнить вручную' : value === 'sale' ? 'Продажа' : value === 'rent' ? 'Аренда' : value}</dd></div> })}</dl>
      <p className="text-xs text-muted-foreground">Распознавание по шаблонам, не проверка фактов. Цена переносится только при явном USD/$, без конвертации. Тип объекта, адрес и собственник заполняются вручную. Неоднозначные поля остаются без изменений.</p>
      <label className="flex items-start gap-3 text-sm"><input type="checkbox" className="mt-1 size-5 shrink-0" checked={reviewed} onChange={e => setReviewed(e.target.checked)} />Я проверил поля: распознанные значения заменят соответствующие поля формы.</label>
      <button type="button" disabled={!reviewed || !!duplicate || (!!url.trim() && !normalized)} className="min-h-11 w-full rounded-xl bg-primary p-3 font-medium text-primary-foreground disabled:opacity-40" onClick={() => { onApply(fields, { text: text.trim(), url: normalized || undefined }); setMessage('Перенесено в форму ниже. Объект ещё не сохранён. Проверьте тип, цену и остальные поля.'); setReviewed(false) }}>Перенести в форму</button>
    </div>}
    <p role="status" className="mt-3 text-sm text-muted-foreground">{message}</p>
  </details>
}
