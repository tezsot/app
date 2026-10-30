'use client'

import { useState } from 'react'
import { type Property, money, propertyTitle } from '@/lib/data'
import { Segmented } from '@/components/ios/primitives'
import { Building2, Copy, Info, ShieldCheck, AlertCircle } from 'lucide-react'

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
  const [applied, setApplied] = useState({ lang: 'ru' as 'ru' | 'uz', channel: 'tg' as 'tg' | 'olx' })
  const [imageFailed, setImageFailed] = useState(false)
  const image = property.image || property.images?.[0]
  const dirty = text !== template(property, applied.lang, applied.channel)
  const pending = lang !== applied.lang || channel !== applied.channel
  function generate() { setText(template(property, lang, channel)); setApplied({ lang, channel }); setConfirm(false); setReviewed(false); setMessage('Шаблон обновлён. Проверьте характеристики перед копированием.') }
  const button = 'min-h-11 rounded-xl border border-border px-4 py-2 text-sm font-medium disabled:opacity-40'
  return <div className="flex flex-col gap-5 px-4 pb-6 pt-2">
    <div className="flex items-center gap-3 rounded-[22px] border border-border bg-card p-3"><div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-secondary">{image && !imageFailed ? <img src={image} alt="" onError={() => setImageFailed(true)} className="size-full object-cover" /> : <Building2 className="size-7 text-muted-foreground" aria-hidden />}</div><div className="flex min-w-0 flex-col gap-1"><p className="text-xs text-muted-foreground">{property.op === 'rent' ? 'Аренда' : 'Продажа'} · {property.district}</p><p className="text-[15px] font-semibold">{propertyTitle(property)}</p><p className="text-sm font-medium tabular-nums">{money(property.price)}{property.op === 'rent' ? ' / мес.' : ''}</p></div></div>
    <details className="rounded-2xl bg-secondary px-4 py-2"><summary className="min-h-11 cursor-pointer py-3 text-sm font-medium"><Info className="mr-2 inline size-4 text-muted-foreground" aria-hidden />Черновик · публикация вручную</summary><p className="pb-3 text-sm leading-relaxed text-muted-foreground">Текст составлен по карточке объекта. Внешние публикации не загружаются. Телефон и точный адрес не включаются автоматически. Фото здесь — для ориентира и не копируется. После закрытия редактора правки сбросятся.</p></details>
    {property.freshness !== 'confirmed' && <div role="note" className="flex gap-3 rounded-2xl border border-border p-4"><AlertCircle className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden /><div><p className="text-sm font-medium">Проверьте актуальность</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Доступность и цена объекта ещё не подтверждены.</p></div></div>}
    <fieldset className="flex min-w-0 flex-col gap-2"><legend className="mb-2 text-sm font-medium">Площадка</legend><Segmented value={channel} onChange={value => { setChannel(value); setConfirm(false) }} options={[{ value: 'tg', label: 'Telegram' }, { value: 'olx', label: 'OLX' }]} /><p className="text-xs text-muted-foreground">{channel === 'tg' ? 'Короткие строки — удобно читать в канале.' : 'Компактное описание для карточки объявления.'}</p></fieldset>
    <fieldset className="min-w-0"><legend className="mb-2 text-sm font-medium">Язык текста</legend><Segmented value={lang} onChange={value => { setLang(value); setConfirm(false) }} options={[{ value: 'ru', label: 'Русский' }, { value: 'uz', label: 'O‘zbekcha' }]} /></fieldset>
    {(pending || dirty) && <div className="flex flex-col gap-3 rounded-2xl border border-border p-4"><p className="text-sm text-muted-foreground">{pending ? 'Новые настройки ещё не применены. Текущий текст сохранён.' : 'В тексте есть ваши правки. Можно восстановить шаблон.'}</p><button className={button} onClick={() => dirty ? setConfirm(true) : generate()}>{pending ? 'Применить настройки' : 'Восстановить шаблон'}</button></div>}
    {confirm && <div className="rounded-xl border border-border p-3"><p className="text-sm">Заменить текущий текст? Ручные правки будут потеряны.</p><div className="mt-3 flex flex-wrap gap-2"><button className={button} onClick={generate}>Заменить текст</button><button className={button} onClick={() => setConfirm(false)}>Оставить правки</button></div></div>}
    <fieldset className="min-w-0"><legend className="mb-2 text-sm font-medium">Объявление <span className="font-normal text-muted-foreground">· {applied.channel === 'tg' ? 'Telegram' : 'OLX'} / {applied.lang.toUpperCase()}</span></legend><Segmented value={preview ? 'preview' : 'edit'} onChange={value => setPreview(value === 'preview')} options={[{ value: 'edit', label: 'Редактор' }, { value: 'preview', label: 'Предпросмотр' }]} /></fieldset>
    {preview ? <div className="whitespace-pre-wrap break-words rounded-2xl bg-card p-4 text-[15px] leading-relaxed" aria-label="Предпросмотр объявления">{text.trim() || 'Текст пока пуст'}</div> : <label className="block text-sm">Текст объявления<textarea value={text} maxLength={5000} rows={9} onChange={e => { setText(e.target.value); setReviewed(false); setMessage('') }} className="mt-2 w-full rounded-xl border border-border bg-background p-3 text-base" /><span className="text-xs text-muted-foreground">{text.length} / 5000 символов</span></label>}
    <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-2xl border border-border p-4 text-sm"><input type="checkbox" className="mt-1 size-5 shrink-0 accent-primary" checked={reviewed} onChange={e => setReviewed(e.target.checked)} /><span className="flex flex-col gap-1"><span className="font-medium">Готово к копированию</span><span className="text-xs leading-relaxed text-muted-foreground">Я проверил цену и характеристики. Нет неподтверждённых обещаний или лишних личных данных.</span></span><ShieldCheck className="size-5 shrink-0 text-muted-foreground" aria-hidden /></label>
    <button className="min-h-11 w-full rounded-xl bg-primary p-3 font-semibold text-primary-foreground disabled:opacity-40" disabled={!reviewed || !text.trim()} onClick={async () => { try { await navigator.clipboard.writeText(text); setMessage('Текст скопирован. Опубликуйте его самостоятельно.') } catch { setMessage('Копирование недоступно. Вернитесь в редактор и скопируйте текст вручную.') } }}><Copy className="mr-2 inline size-4" aria-hidden />Скопировать текст</button>
    <p role="status" className="text-sm text-muted-foreground">{message}</p>
  </div>
}
