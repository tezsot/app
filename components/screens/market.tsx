'use client'

import { useState } from 'react'
import { Screen } from '@/components/ios/primitives'

const districts = [
  { name: 'Юнусабад', sale: [1120, 1135, 1140, 1130, 1150, 1165], rent: [490, 500, 495, 510, 515, 520], count: 126 },
  { name: 'Мирзо-Улугбек', sale: [1240, 1260, 1255, 1270, 1290, 1300], rent: [550, 555, 560, 570, 565, 580], count: 98 },
  { name: 'Чиланзар', sale: [960, 955, 970, 980, 975, 990], rent: [410, 415, 420, 415, 425, 430], count: 143 },
  { name: 'Яккасарай', sale: [1380, 1390, 1410, 1400, 1420, 1440], rent: [620, 630, 625, 640, 650, 660], count: 84 },
]
const months = ['Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь']
const number = (value: number) => value.toLocaleString('ru-RU', { maximumFractionDigits: 1 })
const field = 'mt-1 min-h-11 w-full rounded-xl border border-border bg-background px-3 text-base'

function InvestmentCalculator() {
  const [price, setPrice] = useState('80000')
  const [setup, setSetup] = useState('5000')
  const [rent, setRent] = useState('520')
  const [vacancy, setVacancy] = useState('1')
  const [expenses, setExpenses] = useState('1200')
  const values = [price, setup, rent, vacancy, expenses].map(Number)
  const valid = [price, setup, rent, vacancy, expenses].every(v => v.trim() !== '') && values.every(v => Number.isFinite(v) && v >= 0) && values[0] > 0 && values[3] <= 12
  const invested = values[0] + values[1]
  const income = values[2] * (12 - values[3]) - values[4]
  return <section className="rounded-2xl bg-card p-4"><h2 className="text-lg font-semibold">Оцените доходность</h2><p className="mt-1 text-sm text-muted-foreground">Свой сценарий · без прогноза роста стоимости</p>
    <div className="mt-4 grid grid-cols-2 gap-3">{[
      ['Цена покупки, $', price, setPrice], ['Ремонт и оформление, $', setup, setSetup], ['Аренда в месяц, $', rent, setRent], ['Простой, месяцев/год', vacancy, setVacancy], ['Расходы за год, $', expenses, setExpenses],
    ].map(([label, value, setter]) => <label key={label as string} className="text-sm">{label as string}<input className={field} type="number" min="0" step="any" value={value as string} onChange={e => (setter as (v: string) => void)(e.target.value)} /></label>)}</div>
    <div aria-live="polite" className="mt-4 rounded-xl bg-secondary p-4">{valid ? <><p className="text-sm">Чистая доходность в год</p><p className="mt-1 text-3xl font-semibold tabular-nums">{number(income / invested * 100)}%</p><p className="mt-2 text-sm">Доход после указанных расходов: ${number(income)}/год</p><p className="mt-1 text-sm">Простая окупаемость: {income > 0 ? `${number(invested / income)} лет` : 'не достигается'}</p></> : <p role="alert">Заполните все поля неотрицательными числами. Цена — больше нуля, простой — от 0 до 12 месяцев.</p>}</div>
    <p className="mt-3 text-xs leading-relaxed text-muted-foreground">Укажите в расходах налоги, обслуживание, страховку и управление. Расчёт без кредита, инфляции, роста цены и затрат на последующую продажу. Не инвестиционная рекомендация.</p>
  </section>
}

export function MarketScreen() {
  const [district, setDistrict] = useState(0)
  const [mode, setMode] = useState<'sale' | 'rent'>('sale')
  const [period, setPeriod] = useState(6)
  const selected = districts[district]
  const series = selected[mode].slice(-period)
  const current = series.at(-1)!
  const change = (current / series[0] - 1) * 100
  return <Screen title="Аналитика рынка" back>
    <div className="space-y-4 px-4 pb-8">
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-primary">Демо · Ташкент</p><h2 className="mt-2 text-xl font-semibold">Рынок в деталях</h2><p className="mt-2 text-sm text-muted-foreground">Все значения вымышлены. Сценарий цен предложения двухкомнатных квартир, май–октябрь 2026. Это не цены сделок и не текущая рыночная статистика.</p></div>
      <div className="grid grid-cols-2 gap-3"><label className="text-sm">Район<select className={field} value={district} onChange={e => setDistrict(Number(e.target.value))}>{districts.map((d, i) => <option key={d.name} value={i}>{d.name}</option>)}</select></label><label className="text-sm">Сегмент<select className={field} value={mode} onChange={e => setMode(e.target.value as 'sale' | 'rent')}><option value="sale">Продажа</option><option value="rent">Аренда</option></select></label></div>
      <section className="rounded-2xl bg-card p-4"><div className="flex items-center justify-between gap-3"><h2 className="font-semibold">Динамика цен</h2><select aria-label="Период динамики" className="min-h-11 rounded-lg bg-secondary px-2 text-sm" value={period} onChange={e => setPeriod(Number(e.target.value))}><option value={6}>6 месяцев</option><option value={3}>3 месяца</option></select></div><p className="mt-3 text-3xl font-semibold tabular-nums">${number(current)}<span className="ml-1 text-sm font-normal text-muted-foreground">{mode === 'sale' ? '/м²' : '/месяц'}</span></p><p className="mt-1 text-sm text-muted-foreground">{change >= 0 ? '+' : ''}{number(change)}% с начала выбранного периода</p>
        <table className="mt-4 w-full text-sm"><caption className="sr-only">Демонстрационная медиана цен по месяцам, {selected.name}</caption><thead><tr className="border-b border-border text-muted-foreground"><th className="py-2 text-left font-normal">2026</th><th className="text-right font-normal">{mode === 'sale' ? '$/м²' : '$/месяц'}</th></tr></thead><tbody>{series.map((value, i) => <tr key={i} className="border-b border-border last:border-0"><td className="py-2">{months[6 - period + i]}</td><td className="text-right tabular-nums">{number(value)}</td></tr>)}</tbody></table>
      </section>
      <section className="rounded-2xl bg-card p-4"><h2 className="font-semibold">Сравнение районов</h2><p className="mt-1 text-xs text-muted-foreground">Октябрь 2026 · условная медиана и число объявлений</p><div className="mt-3 divide-y divide-border">{[...districts].sort((a,b) => a[mode][5] - b[mode][5]).map(d => <button key={d.name} onClick={() => setDistrict(districts.indexOf(d))} aria-pressed={d === selected} className={`flex min-h-16 w-full items-center justify-between gap-3 rounded-lg px-2 text-left ${d === selected ? 'bg-primary/5' : ''}`}><span className="text-sm font-medium">{d.name}<span className="block text-xs font-normal text-muted-foreground">{d.count} демо-объявлений</span></span><span className="text-sm font-semibold tabular-nums">${number(d[mode][5])}</span></button>)}</div><p className="mt-2 text-xs text-muted-foreground">{mode === 'sale' ? 'Цена за м²' : 'Аренда за месяц'}. Состав объявлений влияет на медиану; изменение не доказывает рост стоимости конкретного объекта.</p></section>
      <InvestmentCalculator />
    </div>
  </Screen>
}
