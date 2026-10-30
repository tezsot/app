'use client'

import { useRef, useState } from 'react'
import { FileSpreadsheet, ArrowRight, Check } from 'lucide-react'
import Papa from 'papaparse'
import { Screen } from '@/components/ios/primitives'
import { useStore } from '@/lib/store'
import type { Client } from '@/lib/data'

const fields = { name: 'Имя', phone: 'Телефон', district: 'Район' }
type Field = keyof typeof fields
const phoneKey = (s: string) => { const n = s.replace(/\D/g, ''); return n.length === 9 ? `998${n}` : n }
const sample = [['Имя', 'Телефон', 'Район'], ['Демо клиент А', '+998 90 111 22 33', 'Мирабад'], ['Демо клиент Б', '90 111 22 33', 'Мирабад'], ['Демо клиент В', 'не указан', 'Чиланзар'], ['Демо клиент Г', '+998 90 444 55 66', 'Юнусабад']]

export function ClientImport({ onClose }: { onClose: () => void }) {
  const s = useStore()
  const [rows, setRows] = useState<string[][]>([])
  const [mapping, setMapping] = useState<Record<Field, number>>({ name: 0, phone: 1, district: 2 })
  const [intent, setIntent] = useState<'buy' | 'rent'>('buy')
  const [step, setStep] = useState(0)
  const [filename, setFilename] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [count, setCount] = useState(0)
  const submitted = useRef(false)
  const button = 'min-h-11 rounded-xl border border-border px-4 py-3 text-sm font-medium disabled:opacity-40'
  function load(data: string[][], name: string) {
    if (data.length < 2 || data.length > 501 || data.some(row => row.length > 30 || row.some(cell => cell.length > 500))) throw new Error('Нужно 1–500 строк данных, до 30 столбцов и 500 символов в ячейке.')
    const header = data[0].map(cell => cell.trim().toLowerCase())
    const find = (names: string[]) => header.findIndex(value => names.includes(value))
    setMapping({ name: find(['имя', 'name', 'фио']), phone: find(['телефон', 'phone', 'номер']), district: find(['район', 'district']) })
    setRows(data); setFilename(name); setError(''); setStep(1); submitted.current = false
  }
  const seen = new Set(s.clients.map(c => phoneKey(c.phone)))
  const checked = rows.slice(1).map((row, index) => {
    const name = (row[mapping.name] ?? '').trim()
    const phone = phoneKey(row[mapping.phone] ?? '')
    let reason = !name || name.length > 100 ? 'Проверьте имя' : !/^998\d{9}$/.test(phone) ? 'Нужен номер Узбекистана' : seen.has(phone) ? 'Дубль телефона' : ''
    if (!reason) seen.add(phone)
    return { line: index + 2, name, phone, district: row[mapping.district]?.trim(), reason }
  })
  const ready = checked.filter(row => !row.reason)
  const mappingValid = mapping.name >= 0 && mapping.phone >= 0 && mapping.name !== mapping.phone && (mapping.district < 0 || ![mapping.name, mapping.phone].includes(mapping.district))
  return <Screen title="Импорт клиентов" back onBack={onClose}>
    <div className="space-y-5 px-4 pb-6">
      <div className="rounded-3xl bg-primary p-5 text-primary-foreground"><FileSpreadsheet className="mb-4 size-8" /><p className="text-xs uppercase tracking-widest opacity-70">Таблица → порядок</p><h2 className="mt-2 text-2xl font-semibold leading-tight">Ваша база.<br />Без ручного переноса.</h2><p className="mt-3 text-sm opacity-80">Сначала проверим. Добавим только после вашего подтверждения.</p></div>
      <ol className="flex gap-2 text-xs">{['Файл', 'Поля', 'Проверка', 'Готово'].map((label, i) => <li key={label} aria-current={step === i ? 'step' : undefined} className={`flex-1 rounded-full px-2 py-2 text-center ${i === step ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>{i + 1}. {label}</li>)}</ol>
      <p className="text-xs text-muted-foreground">Демо: используйте тестовые данные. Файл обрабатывается в браузере и не отправляется на сервер. Импорт исчезнет после перезагрузки.</p>
      {error && <p role="alert" className="rounded-xl border border-destructive p-3 text-sm text-destructive">{error}</p>}
      {step === 0 && <div className="space-y-4"><label className="block rounded-2xl border border-dashed border-border bg-card p-5"><span className="block font-medium">Выберите CSV или XLSX</span><span className="mt-2 block text-xs text-muted-foreground">До 1 МБ · 500 клиентов · первая строка — заголовки. XLSX: первый лист. CSV: UTF-8.</span><input type="file" accept=".csv,.xlsx" disabled={busy} className="mt-4 block w-full min-w-0 text-sm file:mr-2 file:rounded-lg file:border-0 file:bg-secondary file:p-3" onChange={async e => {
        const file = e.target.files?.[0]; if (!file) return
        setBusy(true); setError('')
        try {
          if (file.size > 1024 * 1024) throw new Error('Файл больше 1 МБ.')
          let data: string[][]
          if (/\.xlsx$/i.test(file.name)) { const { readSheet } = await import('read-excel-file/browser'); const sheet = await readSheet(file, 1); data = sheet.map((row: unknown[]) => row.map((cell: unknown) => cell == null ? '' : String(cell))) }
          else if (/\.csv$/i.test(file.name)) { const result = Papa.parse<string[]>(await file.text(), { skipEmptyLines: 'greedy' }); if (result.errors.length) throw new Error('Не удалось разобрать CSV. Проверьте разделители и кавычки.'); data = result.data }
          else throw new Error('Поддерживаются только CSV и XLSX.')
          load(data, file.name)
        } catch (err) { setError(err instanceof Error ? err.message : 'Не удалось прочитать файл.') } finally { setBusy(false); e.target.value = '' }
      }} /></label><button className={`${button} w-full`} disabled={busy} onClick={() => load(sample, 'Пример: дубли и ошибки')}>Попробовать на примере</button>{busy && <p role="status">Читаем таблицу…</p>}</div>}
      {step === 1 && <div className="space-y-4"><p className="break-words text-sm font-medium">{filename} · {rows.length - 1} строк</p>{(Object.keys(fields) as Field[]).map(field => <label key={field} className="block text-sm">{fields[field]}{field !== 'district' && ' *'}<select value={mapping[field]} onChange={e => setMapping({ ...mapping, [field]: Number(e.target.value) })} className="mt-2 min-h-11 w-full rounded-xl border border-border bg-card p-3"><option value={-1}>Не импортировать</option>{rows[0].map((header, i) => <option key={i} value={i}>{i + 1}. {header || 'Без названия'}</option>)}</select><span className="mt-1 block text-xs text-muted-foreground">Пример: {rows[1]?.[mapping[field]] || '—'}</span></label>)}<label className="block text-sm">Запрос для всех новых клиентов<select value={intent} onChange={e => setIntent(e.target.value as 'buy' | 'rent')} className="mt-2 min-h-11 w-full rounded-xl border border-border bg-card p-3"><option value="buy">Покупка</option><option value="rent">Аренда</option></select></label><p className="text-xs text-muted-foreground">Другие столбцы не импортируются. Бюджет и тип объекта уточните в карточке. Имя и телефон должны соответствовать разным столбцам.</p><button className={`${button} w-full`} disabled={!mappingValid} onClick={() => setStep(2)}>Проверить таблицу <ArrowRight className="ml-2 inline size-4" /></button><button className={button} onClick={() => setStep(0)}>Другой файл</button></div>}
      {step === 2 && <div className="space-y-4"><div className="grid grid-cols-2 gap-3"><div className="rounded-2xl bg-secondary p-4"><p className="text-3xl font-semibold">{ready.length}</p><p className="text-xs">Готовы к импорту</p></div><div className="rounded-2xl bg-secondary p-4"><p className="text-3xl font-semibold">{checked.length - ready.length}</p><p className="text-xs">Будут пропущены</p></div></div><p className="text-sm text-muted-foreground">Дубли проверяются по телефону внутри файла и в текущей базе. Существующие клиенты не меняются. Номера из 9 цифр получают код +998.</p><div className="max-h-80 overflow-y-auto rounded-xl border border-border">{checked.map(row => <div key={row.line} className="border-b border-border p-3 text-sm last:border-0"><p className="font-medium">Строка {row.line} · {row.name || 'Без имени'}</p><p className="text-muted-foreground">+{row.phone || '—'}</p><p>{row.reason || 'Готов к добавлению'}</p></div>)}</div><button className="min-h-11 w-full rounded-xl bg-primary p-3 font-semibold text-primary-foreground disabled:opacity-40" disabled={!ready.length} onClick={() => {
        if (submitted.current) return
        submitted.current = true
        const candidates: Client[] = ready.map(row => ({ id: crypto.randomUUID(), name: row.name, phone: `+${row.phone}`, district: row.district, intent, kind: 'Не указан', status: 'new', source: 'Импорт таблицы (демо)', history: [{ id: crypto.randomUUID(), label: 'Добавлен из таблицы в демо', when: 'только что' }] }))
        s.setClients(current => { const phones = new Set(current.map(c => phoneKey(c.phone))); return [...candidates.filter(c => { const key = phoneKey(c.phone); if (phones.has(key)) return false; phones.add(key); return true }), ...current] })
        setCount(candidates.length); setStep(3)
      }}>Добавить {ready.length} клиентов в демо</button><button className={button} onClick={() => setStep(1)}>Исправить сопоставление</button></div>}
      {step === 3 && <div className="rounded-2xl border border-border bg-card p-5"><Check className="mb-4 size-8" /><h2 className="text-xl font-semibold">База стала больше на {count}</h2><p className="mt-2 text-sm text-muted-foreground">Клиенты уже в общем списке. Откройте карточку, уточните запрос и назначьте следующий контакт.</p><button className={`${button} mt-5 w-full`} onClick={onClose}>Перейти к клиентам</button></div>}
    </div>
  </Screen>
}
