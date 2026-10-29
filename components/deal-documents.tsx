'use client'

import { useState } from 'react'
import { type Deal } from '@/lib/data'
import { useStore } from '@/lib/store'

const statuses = { missing: 'Отсутствует', received: 'Получен', review: 'Требует проверки', checked: 'Проверен' } as const
export type DocumentStatus = keyof typeof statuses
export interface DocumentRevision { id: string; status: DocumentStatus; comment: string; at: string }
export interface DealDocument { id: string; title: string; revisions: DocumentRevision[] }
const defaults = ['Документы участников', 'Документ о праве на объект', 'Кадастровые сведения', 'Проект договора']
const date = (at: string) => new Date(at).toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent' })

export function DealDocuments({ deal }: { deal: Deal }) {
  const store = useStore()
  const documents = deal.documents ?? defaults.map((title, i) => ({ id: `document-${i}`, title, revisions: [] }))
  const [editing, setEditing] = useState<string | null>(null)
  const [status, setStatus] = useState<DocumentStatus>('missing')
  const [comment, setComment] = useState('')
  const [notice, setNotice] = useState('')
  const checked = documents.filter(d => d.revisions[0]?.status === 'checked').length
  const button = 'min-h-11 rounded-xl border border-border px-3 py-2 text-sm font-medium disabled:opacity-40'
  return <section className="mx-4 mb-6 rounded-2xl border border-border bg-card p-4" aria-labelledby="documents-title">
    <div className="flex items-start justify-between gap-3"><h2 id="documents-title" className="text-lg font-semibold">Документы</h2><span className="shrink-0 rounded-full bg-secondary px-3 py-1 text-xs tabular-nums">{checked} / {documents.length} проверено</span></div>
    <p className="mt-2 text-sm text-muted-foreground">Рабочий чек-лист, не юридическое заключение. Состав документов и шаблоны договора нужно проверить с юристом.</p>
    <p className="mt-2 text-xs text-muted-foreground">Демо: изменения сохраняются только в текущей сессии. Файлы не загружаются. Не вводите паспортные данные. Время — Ташкент.</p>
    <div className="mt-4 space-y-3">{documents.map(doc => {
      const latest = doc.revisions[0]
      const current = latest?.status ?? 'missing'
      return <article key={doc.id} className="rounded-xl border border-border p-3">
        <h3 className="font-medium">{doc.title}</h3>
        <p className={`mt-1 text-sm ${current === 'checked' ? 'text-foreground' : 'text-muted-foreground'}`}>{statuses[current]}</p>
        {latest && <><p className="mt-1 text-xs text-muted-foreground">{current === 'checked' ? 'Отметка проверки' : 'Обновлено'}: {date(latest.at)}</p><p className="mt-2 whitespace-pre-wrap break-words text-sm">{latest.comment}</p></>}
        {editing !== doc.id ? <button className={`${button} mt-3`} disabled={!!deal.cancellation} onClick={() => { setEditing(doc.id); setStatus(current); setComment(''); setNotice('') }}>Изменить статус</button> : <form className="mt-3 space-y-3" onSubmit={e => {
          e.preventDefault()
          if (!comment.trim() || deal.cancellation) return
          const at = new Date().toISOString()
          const revision = { id: crypto.randomUUID(), status, comment: comment.trim(), at }
          store.updateDeal(deal.id, currentDeal => ({ ...currentDeal, documents: (currentDeal.documents ?? documents).map(item => item.id === doc.id ? { ...item, revisions: [revision, ...item.revisions] } : item), history: [{ id: revision.id, label: `${doc.title}: ${statuses[status]}. ${revision.comment}`, when: date(at) }, ...currentDeal.history] }))
          setEditing(null); setNotice('Статус записан в демо. Предыдущие изменения сохранены в истории.')
        }}>
          <label className="block text-sm">Статус<select className="mt-1 min-h-11 w-full rounded-xl border border-border bg-background p-2" value={status} onChange={e => setStatus(e.target.value as DocumentStatus)}>{Object.entries(statuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label className="block text-sm">Комментарий к изменению<textarea required maxLength={500} rows={3} className="mt-1 w-full rounded-xl border border-border bg-background p-3" placeholder="Что получено или что нужно проверить" value={comment} onChange={e => setComment(e.target.value)} /></label>
          {status === 'checked' && <p className="text-xs text-muted-foreground">Укажите, что именно проверено. Эта отметка не подтверждает юридическую чистоту сделки.</p>}
          <div className="flex flex-wrap gap-2"><button className={button} disabled={!comment.trim() || !!deal.cancellation}>Записать в демо</button><button type="button" className={button} onClick={() => setEditing(null)}>Отмена</button></div>
        </form>}
        {doc.revisions.length > 0 && <details className="mt-3"><summary className="min-h-11 cursor-pointer py-3 text-sm text-muted-foreground">История изменений · {doc.revisions.length}</summary><ol className="space-y-3">{doc.revisions.map((revision, i) => <li key={revision.id} className="border-l-2 border-border pl-3 text-sm"><p>Версия {doc.revisions.length - i} · {statuses[revision.status]}</p><p className="text-xs text-muted-foreground">{date(revision.at)}</p><p className="whitespace-pre-wrap break-words">{revision.comment}</p></li>)}</ol></details>}
      </article>
    })}</div>
    {deal.cancellation && <p className="mt-3 text-sm text-muted-foreground">Сделка отменена. Чек-лист доступен только для просмотра.</p>}
    <p role="status" className="mt-3 text-sm text-muted-foreground">{notice}</p>
  </section>
}
