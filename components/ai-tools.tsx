'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'
import { AI_LANGUAGES, AI_TONES, AI_TOOLS } from '@/lib/ai-tools'
import { useStore } from '@/lib/store'
import { Button, Screen } from '@/components/ios/primitives'

export function AiToolsSection() {
  const s = useStore()
  return <div className="px-4 pb-6"><button onClick={() => s.push({ name: 'ai' })} className="flex min-h-20 w-full items-center gap-3 rounded-2xl bg-card p-4 text-left"><Sparkles className="size-6 text-primary" /><span className="flex-1"><strong className="block">AI-инструменты</strong><span className="text-sm text-muted-foreground">11 помощников для ежедневной работы</span></span><ArrowRight className="size-4" /></button></div>
}

export function AiToolsScreen() {
  const s = useStore()
  const [selected, setSelected] = useState('')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Все')
  const [input, setInput] = useState('')
  const [language, setLanguage] = useState<string>(AI_LANGUAGES[0])
  const [tone, setTone] = useState<string>(AI_TONES[0])
  const [result, setResult] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const controller = useRef<AbortController | null>(null)
  useEffect(() => () => controller.current?.abort(), [])
  const active = AI_TOOLS.find(t => t.id === selected)
  const field = 'mt-2 min-h-11 w-full rounded-xl border border-border bg-card px-3 py-2 text-base'

  function append(text: string) {
    if (input.length + text.length + 2 > 12000) { setError('Контекст не помещается. Сократите текст.'); return }
    setInput(prev => `${prev}${prev ? '\n\n' : ''}${text}`)
  }

  async function generate() {
    if (controller.current || !active || !input.trim()) return
    const current = new AbortController()
    controller.current = current
    setBusy(true); setError('')
    try {
      const response = await fetch('/api/ai-tools', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tool: active.id, input, language, tone }), signal: current.signal })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Не удалось получить ответ')
      if (typeof data.text !== 'string' || !data.text.trim()) throw new Error('Получен пустой ответ. Повторите запрос.')
      setResult(data.text)
    } catch (e) {
      if (!current.signal.aborted) setError(e instanceof Error ? e.message : 'Ошибка сети. Повторите запрос.')
    } finally { controller.current = null; setBusy(false) }
  }

  return <Screen title="AI-инструменты" back>
    <div className="space-y-5 px-4 pb-8">
      <p className="text-sm text-muted-foreground">Меньше рутины. Больше времени на клиентов.</p>
      {!active ? <>
        <label className="block text-sm">Найти инструмент<input className={field} value={query} onChange={e => setQuery(e.target.value)} placeholder="Например, возражение или показ" /></label>
        <div className="flex flex-wrap gap-2">{['Все', 'Объекты', 'Клиенты', 'Сделки'].map(c => <button key={c} aria-pressed={category === c} onClick={() => setCategory(c)} className={`min-h-11 rounded-full px-4 text-sm ${category === c ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>{c}</button>)}</div>
        <div className="space-y-3">{AI_TOOLS.filter(t => (category === 'Все' || t.category === category) && `${t.title} ${t.description}`.toLowerCase().includes(query.trim().toLowerCase())).map(t => <button key={t.id} onClick={() => { setSelected(t.id); setResult(''); setError('') }} className="flex w-full items-center gap-3 rounded-2xl bg-card p-4 text-left"><span className="flex-1"><span className="text-xs text-muted-foreground">{t.category}</span><strong className="mt-1 block text-base">{t.title}</strong><span className="mt-1 block text-sm text-muted-foreground">{t.description}</span></span><ArrowRight className="size-4 shrink-0 text-primary" /></button>)}</div>
        {!AI_TOOLS.some(t => (category === 'Все' || t.category === category) && `${t.title} ${t.description}`.toLowerCase().includes(query.trim().toLowerCase())) && <p role="status">Ничего не найдено. Измените запрос или категорию.</p>}
      </> : <>
        <button disabled={busy} onClick={() => setSelected('')} className="min-h-11 text-sm font-medium text-primary">Все инструменты</button>
        <div><h2 className="text-xl font-semibold">{active.title}</h2><p className="mt-1 text-sm text-muted-foreground">{active.description}</p></div>
        <fieldset disabled={busy} className="space-y-4 disabled:opacity-60">
          <details className="rounded-2xl bg-card p-4"><summary className="cursor-pointer text-sm font-medium">Добавить контекст из CRM</summary>
            <p className="mt-2 text-xs text-muted-foreground">Только характеристики и запрос. Имена, телефоны, адреса собственников и внутренние заметки не добавляются. Можно выбрать несколько объектов.</p>
            <label className="mt-3 block text-sm">Объект<select className={field} value="" onChange={e => { const p = s.properties.find(p => p.id === e.target.value); if (p) append(JSON.stringify({ объект: p.kind, операция: p.op, район: p.district, цена_USD: p.price, комнаты: p.rooms, площадь: p.area, этаж: p.floor, этажность: p.floors, актуальность: p.freshness }, null, 2)) }}><option value="">Выберите объект</option>{s.properties.filter(p => !p.draft).map(p => <option key={p.id} value={p.id}>{p.kind} · {p.district} · {p.price} $</option>)}</select></label>
            <label className="mt-3 block text-sm">Запрос клиента<select className={field} value="" onChange={e => { const c = s.clients.find(c => c.id === e.target.value); if (c) append(JSON.stringify({ запрос: c.intent, тип: c.kind, бюджет_от_USD: c.budgetMin, бюджет_до_USD: c.budgetMax, район: c.district, комнаты: c.rooms }, null, 2)) }}><option value="">Выберите клиента</option>{s.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
          </details>
          <label className="block text-sm">Данные для AI<textarea className={`${field} min-h-44`} maxLength={12000} value={input} onChange={e => setInput(e.target.value)} placeholder="Вставьте факты, текст заявки или заметки. Не добавляйте лишние персональные данные." /><span className="text-xs text-muted-foreground">{input.length}/12 000 · передаётся только этот текст, язык и тон</span></label>
          <div className="grid grid-cols-2 gap-3"><label className="text-sm">Язык<select className={field} value={language} onChange={e => setLanguage(e.target.value)}>{AI_LANGUAGES.map(v => <option key={v}>{v}</option>)}</select></label><label className="text-sm">Тон<select className={field} value={tone} onChange={e => setTone(e.target.value)}>{AI_TONES.map(v => <option key={v}>{v}</option>)}</select></label></div>
        </fieldset>
        <p className="text-xs text-muted-foreground">AI может ошибаться. Проверьте факты перед использованием. Сообщения не отправляются, записи CRM не изменяются. Результат не сохраняется после выхода.</p>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <div aria-live="polite">{busy ? <div className="flex items-center justify-between gap-3"><span className="text-sm">Готовим результат…</span><Button variant="secondary" onClick={() => controller.current?.abort()}>Остановить</Button></div> : <Button className="w-full" disabled={!input.trim()} onClick={generate}>{result ? 'Сгенерировать заново' : 'Подготовить результат'}</Button>}</div>
        {result && <section className="space-y-3" aria-label="Результат генерации"><label className="block text-sm font-medium">Результат — можно редактировать<textarea className={`${field} min-h-80 font-normal`} value={result} onChange={e => setResult(e.target.value)} /></label><Button variant="secondary" onClick={async () => { try { await navigator.clipboard.writeText(result); s.notify('Результат скопирован') } catch { setError('Копирование недоступно. Выделите текст вручную.') } }}>Скопировать</Button></section>}
      </>}
    </div>
  </Screen>
}
