'use client'

import { useState } from 'react'
import { ArrowUpRight, ArrowRight, ArrowLeft, Check, Building2, Users, Sparkles, Phone, CalendarDays, SlidersHorizontal } from 'lucide-react'

const slides = [
  { title: 'Договорённости не теряются.', text: 'От первого разговора до следующего показа. Важное остаётся под рукой.', label: 'Следующий шаг', detail: 'Обсудить варианты завтра', Icon: CalendarDays },
  { title: 'Не просто варианты. Совпадения.', text: 'Сопоставьте запрос с объектами и объясните клиенту преимущества и компромиссы.', label: 'Запрос клиента', detail: '2 комнаты · Юнусабад · до $85 000', Icon: Building2 },
  { title: 'Разговор начинается с контекста.', text: 'Запрос, последний контакт и договорённости — в одной карточке.', label: 'Демо-клиент · входящий', detail: 'Азиза · планирует просмотр в субботу', Icon: Phone },
]
const goals = {
  agent: ['Не терять клиентов', 'Быстрее подбирать объекты', 'Меньше времени на объявления'],
  manager: ['Найти заявки без следующего шага', 'Увидеть, где застревает работа', 'Помочь команде с подбором'],
}
const examples = [
  ['Юнусабад · 2 комнаты', 'Бюджет до $85 000', 'Переезд в ноябре'],
  ['Демо-контакт №1 · следующий шаг не указан', 'Демо-контакт №2 · следующий шаг не указан', 'Демо-контакт №3 · следующий шаг не указан'],
  ['Двухкомнатная квартира в Юнусабаде', '60 м² · 3 этаж из 9 · $85 000', 'Ремонт и документы нужно уточнить'],
]

function PreviewCard({ index = 0 }: { index?: number }) {
  const { label, detail, Icon } = slides[index]
  return <div className="relative mx-2 my-6 rounded-[28px] border border-black/5 bg-white p-6 shadow-[0_16px_50px_-20px_#00000030]">
    <div className="mb-7 flex items-center justify-between"><span className="flex size-12 items-center justify-center rounded-2xl bg-neutral-100"><Icon size={23} aria-hidden="true" /></span><span className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600">Пример</span></div>
    <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">{label}</p><p className="mt-2 text-xl font-semibold tracking-tight">{detail}</p>
    <div className="mt-5 flex items-center gap-2 border-t border-neutral-100 pt-4 text-xs text-emerald-800"><span className="size-1.5 rounded-full bg-emerald-700" />{index === 0 ? 'Черновик задачи · нужно подтвердить' : index === 1 ? 'Видны совпадения и различия' : 'Реальные звонки требуют телефонии'}</div>
  </div>
}

export function ExperienceV2() {
  const [step, setStep] = useState(0)
  const [role, setRole] = useState<'agent' | 'manager'>('agent')
  const [goal, setGoal] = useState(0)
  const [confirmed, setConfirmed] = useState(false)
  const [name, setName] = useState('')
  const [notice, setNotice] = useState('')
  const action = role === 'manager' ? goal === 2 ? 0 : 1 : goal === 2 ? 2 : 0
  const advance = () => { setNotice(''); setStep(s => s + 1) }
  const actionTitle = action === 1 ? 'Найдём следующий шаг.' : action === 2 ? 'Начните с одного объекта.' : 'Превратим сообщение в заявку.'
  const primary = 'flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black'
  return <main className="min-h-dvh bg-[#f5f5f7] text-neutral-950 selection:bg-neutral-200">
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col bg-white shadow-sm">
      <header className="flex items-center justify-between px-6 pb-5 pt-6">
        <div className="flex items-center gap-2.5"><span className="flex size-8 items-center justify-center rounded-xl bg-black text-white"><Building2 size={17} aria-hidden="true" /></span><span className="font-semibold tracking-tight">маклер<span className="ml-2 text-xs font-normal text-neutral-500">/ v2</span></span></div>
        {step > 0 && step < 7 ? <button className="min-h-11 px-2 text-sm text-neutral-600" onClick={() => setStep(step < 4 ? 4 : 8)}>Пропустить</button> : <a href="/" className="flex min-h-11 items-center gap-1 text-xs text-neutral-500">Версия 1 <ArrowUpRight size={13} /></a>}
      </header>
      <div className="flex-1 px-6 pb-6" key={step}>
        {step === 0 && <><p className="mb-4 mt-4 text-xs font-medium uppercase tracking-[.2em] text-neutral-500">Ваше новое рабочее пространство</p><h1 className="text-[42px] leading-[1.08] font-semibold tracking-[-.045em]">Ближе<br />к следующей<br /><span className="text-neutral-400">сделке.</span></h1><p className="mt-5 max-w-xs text-base leading-relaxed text-neutral-600">Клиенты, объекты и следующий шаг. Всё, что нужно, чтобы двигаться вперёд.</p><PreviewCard /><p className="text-center text-xs text-neutral-500">Отдельный прототип · без регистрации</p></>}
        {step >= 1 && step <= 3 && <><div className="mb-7 flex gap-2" aria-label={`Экран ${step} из 3`}>{slides.map((_, i) => <span key={i} className={`h-1 flex-1 rounded-full ${i < step ? 'bg-black' : 'bg-neutral-100'}`} />)}</div><PreviewCard index={step - 1} /><h1 className="mt-8 text-3xl leading-tight font-semibold tracking-tight">{slides[step - 1].title}</h1><p className="mt-4 leading-relaxed text-neutral-600">{slides[step - 1].text}</p></>}
        {step === 4 && <><Eyebrow text="01 / Под вас" /><h1 className="text-3xl font-semibold tracking-tight">Как вы работаете?</h1><p className="mt-3 text-neutral-600">Выберем подходящий первый шаг.</p><div className="my-7 space-y-3">{(['agent', 'manager'] as const).map(r => <button key={r} aria-pressed={role === r} onClick={() => { setRole(r); setGoal(0); setConfirmed(false) }} className={`flex min-h-24 w-full items-center gap-4 rounded-3xl border p-5 text-left ${role === r ? 'border-black bg-neutral-50' : 'border-neutral-200'}`}><Users size={24} /><span className="flex-1"><strong className="block">{r === 'agent' ? 'Риелтор' : 'Руководитель агентства'}</strong><span className="mt-1 block text-sm text-neutral-500">{r === 'agent' ? 'Мои клиенты, объекты и сделки' : 'Команда, заявки и результаты'}</span></span>{role === r && <Check size={18} />}</button>)}</div><label className="block text-sm">Как к вам обращаться? <span className="text-neutral-500">Необязательно</span><input value={name} onChange={e => setName(e.target.value)} maxLength={50} placeholder="Ваше имя" autoComplete="given-name" className="mt-2 min-h-12 w-full rounded-xl border border-neutral-200 px-4" /></label><p className="mt-5 text-xs leading-relaxed text-neutral-500">Выбор роли меняет рекомендации, но не даёт административных прав.</p></>}
        {step === 5 && <><Eyebrow text="02 / Первый приоритет" /><h1 className="text-3xl font-semibold tracking-tight">Что важно сейчас?</h1><p className="mt-3 text-neutral-600">Одна задача для начала. Остальное — рядом.</p><div className="my-8 space-y-3">{goals[role].map((g, i) => <button key={g} aria-pressed={goal === i} onClick={() => { setGoal(i); setConfirmed(false) }} className={`flex min-h-20 w-full items-center gap-4 rounded-2xl border p-5 text-left ${goal === i ? 'border-black bg-neutral-50' : 'border-neutral-200'}`}><span className="text-xs text-neutral-400">0{i + 1}</span><span className="flex-1 font-medium">{g}</span>{goal === i && <Check size={18} />}</button>)}</div></>}
        {step === 6 && <><Eyebrow text="03 / Попробуйте в деле" /><h1 className="text-3xl font-semibold tracking-tight">{actionTitle}</h1><p className="mt-4 leading-relaxed text-neutral-600">{action === 1 ? 'Посмотрите, как можно находить контакты без запланированного действия.' : 'Покажем путь от исходных данных к понятному результату на готовом примере.'}</p><section className="my-7 rounded-3xl bg-neutral-50 p-6"><span className="text-xs uppercase tracking-widest text-neutral-500">Вымышленные исходные данные</span><p className="mt-4 text-lg leading-relaxed">{action === 0 ? '«Ищу двухкомнатную в Юнусабаде, до $85 000. Переезд в ноябре.»' : action === 1 ? '5 контактов. У двух назначен следующий шаг, у трёх поле следующего действия не заполнено.' : 'Продажа · Юнусабад · 2 комнаты · 60 м² · 3/9 этаж · $85 000.'}</p></section><p className="text-sm leading-relaxed text-neutral-500">Это подготовленный пример, не результат работы AI или проверки реальной CRM. Ничего не отправляется на сервер.</p></>}
        {step === 7 && <><Eyebrow text="Первый результат / Демо" /><span className="mb-5 flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-800"><Check /></span><h1 className="text-3xl font-semibold tracking-tight">{action === 1 ? 'Три контакта для проверки.' : action === 2 ? 'Основа объявления готова.' : 'Запрос уже понятнее.'}</h1><div className="my-6 divide-y divide-neutral-100 rounded-3xl border border-neutral-200 px-5">{examples[action].map(t => <p key={t} className="py-4 text-sm">{t}</p>)}</div><p className="text-sm leading-relaxed text-neutral-500">{action === 0 ? 'Нужно уточнить: год переезда, требования к ремонту и способ оплаты.' : action === 1 ? 'Нет следующего действия — не значит, что сделка потеряна. Сначала проверьте историю общения.' : 'Перед публикацией подтвердите характеристики и условия с собственником.'}</p><label className="mt-6 flex items-start gap-3 rounded-2xl bg-neutral-50 p-4 text-sm"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} className="mt-1 size-4 accent-black" />Добавить в мой демо-план: {action === 1 ? 'проверить историю этих контактов' : action === 2 ? 'уточнить данные объекта' : 'уточнить требования клиента'}</label></>}
        {step === 8 && <><Eyebrow text={role === 'agent' ? 'Личное пространство / Демо' : 'Пространство руководителя / Демо'} /><h1 className="text-3xl leading-tight font-semibold tracking-tight">{name.trim() ? `${name.trim()},` : 'Добро пожаловать.'}<br /><span className="text-neutral-400">Ваш следующий шаг.</span></h1><section className="my-7 rounded-3xl bg-black p-6 text-white"><div className="mb-6 flex items-center justify-between"><Sparkles size={20} /><span className="text-xs text-neutral-400">Начните с малого</span></div><h2 className="text-xl font-medium">{confirmed ? 'Продолжить начатое' : goals[role][goal]}</h2><p className="mt-3 text-sm leading-relaxed text-neutral-300">{confirmed ? 'Ваш демо-план готов. Проверьте детали, прежде чем переносить их в рабочую CRM.' : 'Попробуйте один сценарий на примере — без настройки базы и регистрации.'}</p><button className="mt-6 flex min-h-11 items-center gap-2 text-sm font-medium" onClick={() => setStep(confirmed ? 7 : 6)}>Открыть {confirmed ? 'результат' : 'пример'} <ArrowRight size={16} /></button></section><div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">Сегодня</h2><span className="text-xs text-neutral-500">{confirmed ? '1 демо-шаг' : 'Без задач'}</span></div><p className="rounded-2xl border border-neutral-200 p-5 text-sm leading-relaxed text-neutral-600">{confirmed ? action === 1 ? 'Проверить историю контактов перед назначением следующего действия.' : action === 2 ? 'Уточнить ремонт и документы у собственника.' : 'Уточнить требования клиента и год переезда.' : 'Здесь будут ваши договорённости. Реальные задачи из старой версии не изменены.'}</p><button className="mt-5 flex min-h-12 items-center gap-2 text-sm" onClick={() => setStep(4)}><SlidersHorizontal size={16} />Изменить персонализацию</button></>}
      </div>
      <footer className="border-t border-neutral-100 bg-white/95 px-6 pt-4 pb-[max(20px,env(safe-area-inset-bottom))] backdrop-blur-xl">
        {step < 8 ? <button className={primary} onClick={advance}>{step === 0 ? 'Найти первую возможность' : step === 3 ? 'Настроить под меня' : step === 6 ? 'Посмотреть демо-результат' : step === 7 ? 'Открыть моё пространство' : 'Продолжить'}<ArrowRight size={18} /></button> : <a href="/" className={primary}>Перейти в версию 1 <ArrowUpRight size={18} /></a>}
        <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">{step > 0 ? <button onClick={() => setStep(s => s - 1)} className="flex min-h-8 items-center gap-1"><ArrowLeft size={13} />Назад</button> : <span>V2 · самостоятельный прототип</span>}<span>Сброс при перезагрузке</span></div>
        {notice && <p role="status">{notice}</p>}
      </footer>
    </div>
  </main>
}

function Eyebrow({ text }: { text: string }) { return <p className="mb-5 mt-4 text-xs font-medium uppercase tracking-[.16em] text-neutral-500">{text}</p> }
