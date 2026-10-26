'use client'

import { useState } from 'react'

const homes = [
  { id: 'a', district: 'Юнусабад', rooms: 2, price: 82000, area: 58, balcony: true, quiet: true },
  { id: 'b', district: 'Юнусабад', rooms: 3, price: 110000, area: 79, balcony: true, quiet: false },
  { id: 'c', district: 'Чиланзар', rooms: 2, price: 69000, area: 54, balcony: false, quiet: true },
  { id: 'd', district: 'Мирабад', rooms: 2, price: 95000, area: 65, balcony: true, quiet: true },
]
const money = (value: number) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)

export function PropertySearch() {
  const [district, setDistrict] = useState('Юнусабад')
  const [budget, setBudget] = useState('85000')
  const [balcony, setBalcony] = useState(false)
  const [quiet, setQuiet] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const invalid = budget !== '' && (!Number.isFinite(Number(budget)) || Number(budget) <= 0)
  const results = invalid ? [] : homes.filter(home => (!district || home.district === district) && (!budget || home.price <= Number(budget)) && (!balcony || home.balcony) && (!quiet || home.quiet))
  function reset() { setDistrict(''); setBudget(''); setBalcony(false); setQuiet(false) }
  const field = 'mt-2 min-h-12 w-full rounded-xl border border-neutral-200 bg-white px-3 text-base'
  return <section className="mt-7 space-y-5" aria-label="Умный поиск по демо-объектам">
    <div className="rounded-3xl bg-neutral-50 p-5">
      <p className="text-xs uppercase tracking-widest text-neutral-500">Умный поиск / Демо</p>
      <h2 className="mt-2 text-xl font-semibold">Дом под ваш запрос</h2>
      <p className="mt-2 text-sm leading-relaxed text-neutral-600">Четыре вымышленных объекта. Все выбранные условия применяются вместе.</p>
      <div className="mt-5 space-y-4">
        <label className="block text-sm">Район<select className={field} value={district} onChange={event => setDistrict(event.target.value)}><option value="">Любой район</option>{['Юнусабад', 'Чиланзар', 'Мирабад'].map(item => <option key={item}>{item}</option>)}</select></label>
        <label className="block text-sm">Цена до, USD<input className={field} type="number" min="1" inputMode="numeric" value={budget} aria-invalid={invalid} aria-describedby={invalid ? 'budget-error' : undefined} placeholder="Без ограничения" onChange={event => setBudget(event.target.value)} /></label>
        {invalid && <p id="budget-error" role="alert" className="text-sm text-red-700">Укажите положительную сумму или оставьте поле пустым.</p>}
        <label className="flex min-h-11 items-center gap-3 text-sm"><input className="size-5 accent-black" type="checkbox" checked={balcony} onChange={event => setBalcony(event.target.checked)} />С балконом</label>
        <label className="flex min-h-11 items-center gap-3 text-sm"><input className="size-5 accent-black" type="checkbox" checked={quiet} onChange={event => setQuiet(event.target.checked)} />Тихий двор</label>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-neutral-500">Атмосфера — отметка в демонстрационной карточке, не независимая оценка шума.</p>
      <button type="button" onClick={reset} className="mt-3 min-h-11 text-sm underline underline-offset-4">Сбросить фильтры</button>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-2 text-sm" role="status"><span>Найдено: {results.length}</span><span className="text-neutral-500">В подборке: {selected.length}</span></div>
    {!invalid && results.length === 0 && <p className="rounded-2xl border border-neutral-200 p-5 text-sm leading-relaxed">Точных совпадений нет. Увеличьте бюджет или уберите одно из условий — мы не скрываем различия и не подмешиваем неподходящие объекты.</p>}
    {results.map(home => <article key={home.id} className="rounded-3xl border border-neutral-200 p-5">
      <p className="text-xs text-neutral-500">Вымышленный объект · {home.id.toUpperCase()}</p>
      <h3 className="mt-2 text-lg font-semibold">{home.district} · {home.rooms} комнаты</h3>
      <p className="mt-1 text-sm text-neutral-600">{home.area} м² · {home.balcony ? 'С балконом' : 'Без балкона'} · {home.quiet ? 'Тихий двор' : 'Оживлённый двор'}</p>
      <p className="mt-4 text-xl font-semibold">{money(home.price)}</p>
      <p className="mt-3 text-sm leading-relaxed text-emerald-800">{district ? 'Район совпадает. ' : 'Район не ограничен. '}{budget ? `В бюджете, запас ${money(Number(budget) - home.price)}. ` : 'Бюджет не ограничен. '}{balcony && 'Балкон есть. '}{quiet && 'Есть отметка «тихий двор».'}</p>
      <button type="button" aria-pressed={selected.includes(home.id)} onClick={() => setSelected(items => items.includes(home.id) ? items.filter(id => id !== home.id) : [...items, home.id])} className="mt-4 min-h-12 w-full rounded-xl bg-black px-4 py-3 text-sm font-medium text-white">{selected.includes(home.id) ? 'Убрать из подборки' : 'В подборку'}</button>
    </article>)}
    {selected.length > 0 && <aside className="rounded-2xl bg-neutral-50 p-5"><h3 className="font-semibold">Ваша демо-подборка</h3><p className="mt-2 text-xs text-neutral-500">Сохраняется при смене фильтров, сбрасывается при выходе из сценария.</p><ul className="mt-3 divide-y divide-neutral-200">{homes.filter(home => selected.includes(home.id)).map(home => <li key={home.id} className="py-3 text-sm">{home.district} · {home.area} м² · {money(home.price)}<button type="button" aria-label={`Удалить объект ${home.id.toUpperCase()} из подборки`} onClick={() => setSelected(items => items.filter(id => id !== home.id))} className="block min-h-11 text-neutral-600 underline">Удалить</button></li>)}</ul></aside>}
  </section>
}
