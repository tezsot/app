'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Building2, Check, Clock3, Search, FileText, Users } from 'lucide-react'
import { FirstAction, initialDraft } from './first-action'

const pains = [
  { title: 'Теряю договорённости', text: 'Собрать запрос и следующий контакт в одном месте.', icon: Clock3 },
  { title: 'Долго ищу объекты', text: 'Понять совпадения и компромиссы до показа.', icon: Search },
  { title: 'Тону в рутине', text: 'Начать объявление с фактов, а не с пустого листа.', icon: FileText },
  { title: 'Не вижу работу команды', text: 'Найти заявки, которым нужен следующий шаг.', icon: Users },
]

export function IntroExperience() {
  const [pain, setPain] = useState<number | null>(null)
  const [stage, setStage] = useState<'choose' | 'try' | 'continue'>('choose')
  const [result, setResult] = useState('')
  const [draft, setDraft] = useState(initialDraft)
  const button = 'flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl bg-neutral-950 px-5 text-left text-sm font-medium text-white'
  return <main className="min-h-dvh bg-[#faf9f6] font-sans text-neutral-950 selection:bg-emerald-100 [&_button]:cursor-pointer [&_button]:focus-visible:outline-2 [&_button]:focus-visible:outline-offset-4 [&_button]:focus-visible:outline-emerald-800">
    <div className="mx-auto max-w-4xl px-6 pb-10 sm:px-10">
      <header className="flex items-center justify-between gap-3 py-6"><span className="flex items-center gap-2 text-sm font-semibold"><Building2 size={20} aria-hidden="true" />PropTech <span className="text-xs text-neutral-500">INTRO V3</span></span><Link className="py-3 text-xs underline underline-offset-4" href="/v2">Сравнить с V2</Link></header>
      <div className="mb-7 flex gap-2" aria-label={`Шаг ${stage === 'choose' ? 1 : stage === 'try' ? 2 : 3} из 3`}>
        {['Ваша задача', 'Попробуйте', 'Следующий шаг'].map((text, i) => <span key={text} className={`flex-1 border-t-2 pt-3 text-xs ${i <= (stage === 'choose' ? 0 : stage === 'try' ? 1 : 2) ? 'border-neutral-950 text-neutral-950' : 'border-neutral-200 text-neutral-500'}`}>{text}</span>)}
      </div>
      {stage === 'choose' ? <section>
        <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">Ваш рабочий день. Без лишнего.</p>
        <h1 className="mt-4 max-w-xl text-[38px] font-semibold leading-[1.1] tracking-tight sm:text-5xl">Что мешает работать с клиентами?</h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-neutral-600">Выберите знакомую ситуацию. Вместо экскурсии по кнопкам — один полезный шаг.</p>
        <div className="my-7 grid gap-3 sm:grid-cols-2">{pains.map((item, i) => <button key={item.title} aria-pressed={pain === i} onClick={() => setPain(i)} className={`flex items-start gap-4 rounded-3xl border p-5 text-left ${pain === i ? 'border-emerald-800 bg-emerald-50' : 'border-neutral-200 bg-white'}`}><item.icon size={22} className="mt-1 shrink-0" aria-hidden="true" /><span className="flex-1"><span className="block font-semibold">{item.title}</span><span className="mt-2 block text-sm leading-relaxed text-neutral-600">{item.text}</span></span>{pain === i && <Check size={18} aria-hidden="true" />}</button>)}</div>
        <button className={`${button} disabled:cursor-not-allowed disabled:opacity-40`} disabled={pain === null} onClick={() => setStage('try')}>Попробовать на примере<ArrowRight size={18} aria-hidden="true" /></button>
        <p className="mt-4 text-xs leading-relaxed text-neutral-500">Без регистрации и импорта базы. Только вымышленные данные; ничего не отправляется в CRM.</p>
        <Link href="/" className="mt-4 inline-block py-3 text-sm underline underline-offset-4">Пропустить знакомство — открыть текущую версию</Link>
      </section> : stage === 'try' ? <section>
        <button className="mb-5 flex min-h-11 items-center gap-2 text-sm" onClick={() => setStage('choose')}><ArrowLeft size={16} aria-hidden="true" />Выбрать другую задачу</button>
        <FirstAction key={pain} kind={pain ?? 0} draft={draft} onChange={setDraft} onComplete={text => { setResult(text); setStage('continue') }} />
      </section> : <section>
        <p className="text-xs uppercase tracking-widest text-emerald-800">Первый шаг готов · демо</p><h1 className="mt-4 text-4xl font-semibold tracking-tight">Теперь понятно, что дальше.</h1>
        <div className="my-6 rounded-3xl border border-emerald-200 bg-white p-6"><p className="text-xs text-neutral-500">Ваш результат в этой сессии</p><p className="mt-3 whitespace-pre-line text-base leading-relaxed">{result}</p></div>
        <h2 className="text-lg font-semibold">Одна история, а не пять разных сервисов</h2><p className="mt-3 text-sm leading-relaxed text-neutral-600">Запрос клиента → подбор → показ → следующий контакт → сделка. На каждом этапе остаются договорённости и понятное действие.</p>
        <div className="mt-6 rounded-2xl bg-neutral-100 p-5 text-sm leading-relaxed"><strong>Вы контролируете результат.</strong><p className="mt-2">Этот пример работает без AI и не создаёт реальные задачи. Публикация, отправка клиенту и изменение данных требуют отдельного подтверждения в рабочем продукте. Права команды и постоянное хранение здесь не подключены.</p></div>
        <button className={`${button} mt-6`} onClick={() => setStage('try')}>Продолжить с моим примером<ArrowRight size={18} aria-hidden="true" /></button>
        <button className="mt-3 min-h-11 w-full text-sm underline underline-offset-4" onClick={() => setStage('choose')}>Посмотреть другую возможность</button>
        <p className="mt-4 text-xs text-neutral-500">Демо-результат сбросится после перезагрузки страницы.</p>
      </section>}
    </div>
  </main>
}
