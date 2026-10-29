'use client'

import { useState } from 'react'
import { type Property } from '@/lib/data'

function template(p: Property, lang: 'ru' | 'uz', channel: 'tg' | 'olx') {
  const uz = lang === 'uz'
  const kinds: Record<Property['kind'], string> = { 'Квартира': 'Kvartira', 'Дом': 'Uy', 'Таунхаус': 'Taunhaus', 'Дача': 'Dacha', 'Участок': 'Yer uchastkasi', 'Офис': 'Ofis', 'Торговое помещение': 'Savdo binosi', 'Склад': 'Ombor', 'Гараж': 'Garaj', 'Коммерция': 'Tijorat obyekti' }
  const title = `${uz ? kinds[p.kind] : p.kind} ${p.op === 'sale' ? uz ? 'sotiladi' : 'продаётся' : uz ? 'ijaraga beriladi' : 'сдаётся'}`
  const lines = [title, p.district, p.rooms ? `${uz ? 'Xonalar' : 'Комнат'}: ${p.rooms}` : '', p.area ? `${uz ? 'Maydon' : 'Площадь'}: ${p.area} m²` : '', p.floor ? `${uz ? 'Qavat' : 'Этаж'}: ${p.floor}${p.floors ? ` / ${p.floors}` : ''}` : '', `${uz ? 'Narx' : 'Цена'}: ${new Intl.NumberFormat(uz ? 'uz-UZ' : 'ru-RU').format(p.price)} USD${p.op === 'rent' ? uz ? ' / oy' : ' / месяц' : ''}`].filter(Boolean)
  return lines.join(channel === 'tg' ? '\n' : '. ') + (channel === 'olx' ? '.' : '')
}
export function ListingEditor({ property }: { property: Property }) {
  const [lang, setLang] = useState<'ru' | 'uz'>('ru')
  const [channel, setChannel] = useState<'tg' | 'olx'>('tg')
  const [text, setText] = useState(() => template(property, 'ru', 'tg'))
  const [preview, setPreview] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [message, setMessage] = useState('')
  const [reviewed, setReviewed] = useState(false)
  const dirty = text !== template(property, lang, channel)
  function generate() { setText(template(property, lang, channel)); setConfirm(false); setReviewed(false); setMessage('Шаблон обновлён. Проверьте характеристики перед копированием.') }
  const button = 'min-h-11 rounded-xl border border-border px-4 py-2 text-sm font-medium disabled:opacity-40'
  return <div className="space-y-4 px-4 pb-6 pt-2">
    <p className="text-sm text-muted-foreground">Демо · публикации нет. Текст берётся из карточки объекта, а не из внешних источников. Телефон и точный адрес не добавляются. Изменения сбросятся после закрытия.</p>
    {property.freshness !== 'confirmed' && <p role="note" className="rounded-xl border border-amber-500/40 p-3 text-sm">Объект не отмечен актуальным. Уточните доступность и цену до публикации.</p>}
    <div className="grid grid-cols-2 gap-3"><label className="text-sm">Язык шаблона<select value={lang} onChange={e => { setLang(e.target.value as 'ru' | 'uz'); setConfirm(false) }} className={`${button} mt-2 w-full bg-background`}><option value="ru">Русский</option><option value="uz">O‘zbekcha</option></select></label><label className="text-sm">Формат<select value={channel} onChange={e => { setChannel(e.target.value as 'tg' | 'olx'); setConfirm(false) }} className={`${button} mt-2 w-full bg-background`}><option value="tg">Telegram</option><option value="olx">OLX</option></select></label></div>
    <p className="text-xs text-muted-foreground">Выбор языка и формата не стирает текст. Примените новый шаблон кнопкой ниже; названия районов сохраняются как в карточке.</p>
    <button className={button} onClick={() => dirty ? setConfirm(true) : generate()}>Применить шаблон</button>
    {confirm && <div className="rounded-xl border border-border p-3"><p className="text-sm">Заменить текущий текст? Ручные правки будут потеряны.</p><div className="mt-3 flex flex-wrap gap-2"><button className={button} onClick={generate}>Заменить текст</button><button className={button} onClick={() => setConfirm(false)}>Оставить правки</button></div></div>}
    <div className="flex gap-2"><button className={button} aria-pressed={!preview} onClick={() => setPreview(false)}>Редактор</button><button className={button} aria-pressed={preview} onClick={() => setPreview(true)}>Предпросмотр</button></div>
    {preview ? <div className="whitespace-pre-wrap break-words rounded-2xl bg-card p-4 text-[15px] leading-relaxed" aria-label="Предпросмотр объявления">{text.trim() || 'Текст пока пуст'}</div> : <label className="block text-sm">Текст объявления<textarea value={text} maxLength={5000} rows={9} onChange={e => { setText(e.target.value); setReviewed(false); setMessage('') }} className="mt-2 w-full rounded-xl border border-border bg-background p-3 text-base" /><span className="text-xs text-muted-foreground">{text.length} / 5000 символов</span></label>}
    <label className="flex min-h-11 items-start gap-3 text-sm"><input type="checkbox" className="mt-1 size-5 shrink-0" checked={reviewed} onChange={e => setReviewed(e.target.checked)} />Характеристики и цена проверены. В тексте нет неподтверждённых обещаний.</label>
    <button className="min-h-11 w-full rounded-xl bg-primary p-3 font-semibold text-primary-foreground disabled:opacity-40" disabled={!reviewed || !text.trim()} onClick={async () => { try { await navigator.clipboard.writeText(text); setMessage('Текст скопирован. Опубликуйте его самостоятельно.') } catch { setMessage('Копирование недоступно. Вернитесь в редактор и скопируйте текст вручную.') } }}>Скопировать текст</button>
    <p role="status" className="text-sm text-muted-foreground">{message}</p>
  </div>
}
