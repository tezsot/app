'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { Users, Building2, CalendarDays, Handshake, Sparkles, ChartNoAxesCombined, ArrowRight } from 'lucide-react'

const slides = [
  ['Весь ваш бизнес. В одном приложении', 'От первого обращения до сделки — клиенты, объекты и следующие шаги в одном месте.'],
  ['Не вспоминайте. Продолжайте работу', 'Запрос, подходящие объекты и следующий контакт — рядом с клиентом.'],
  ['Не просто варианты. Подходящий дом', 'Подбирайте по расположению, цене, удобствам и атмосфере. Сравнивайте совпадения и компромиссы.'],
  ['Меньше пустого листа. Больше дела', 'Подготовьте черновик по фактам об объекте. Проверьте детали — последнее слово за вами.'],
  ['После каждого показа — следующий шаг', 'Держите обратную связь, договорённости и этап сделки вместе. Знайте, с кем и когда связаться.'],
  ['Видеть главное. Действовать вовремя', 'Следите за следующими шагами по клиентам и сделкам — самостоятельно или вместе с командой.'],
]
const icons = [Users, Building2, CalendarDays, Handshake, Sparkles, ChartNoAxesCombined]
const labels = ['Клиенты', 'Объекты', 'Показы', 'Сделки', 'AI', 'Аналитика']

function Example({ step }: { step: number }) {
  if (step === 0) return <div className="grid grid-cols-3 gap-x-4 gap-y-5 py-2">{icons.map((Icon, i) => <div key={labels[i]} className="flex flex-col items-center gap-2"><span className="flex size-14 items-center justify-center rounded-2xl bg-[#f5f5f7]"><Icon size={27} strokeWidth={1.6} aria-hidden="true" /></span><span className="text-xs font-medium">{labels[i]}</span></div>)}</div>
  return <div className="rounded-3xl bg-[#f5f5f7] p-5 text-sm leading-relaxed"><p className="mb-3 text-xs font-medium uppercase tracking-widest text-[#616161]">Пример · {['', 'Клиенты и объекты', 'Умный поиск', 'AI-помощник', 'Показы и сделки', 'Команда'][step]}</p>
    {step === 1 && <><strong className="text-lg">Азиза · Покупатель</strong><p className="mt-2">2 комнаты · Юнусабад · до $85 000</p><p className="mt-3">Подборка: 3 объекта для обсуждения</p><p className="mt-3 border-t border-neutral-300 pt-3">Следующий шаг: уточнить время показа завтра</p></>}
    {step === 2 && <><p className="mb-3 text-[#616161]">Юнусабад · до $85 000 · балкон · тихий двор</p><div className="rounded-xl bg-white p-3"><strong>2 комнаты · $82 000</strong><p>Район, бюджет, балкон — подходят.</p><p className="text-[#616161]">Тишину во дворе нужно проверить.</p></div><div className="mt-2 rounded-xl bg-white p-3"><strong>2 комнаты · $79 000</strong><p>Район и бюджет подходят. Балкона нет.</p></div></>}
    {step === 3 && <><p className="text-[#616161]">2 комнаты · Юнусабад · 58 м² · балкон · $82 000</p><p className="mt-4 rounded-xl bg-white p-4">Двухкомнатная квартира в Юнусабаде. Площадь — 58 м², есть балкон. Стоимость — $82 000.</p><p className="mt-3 font-medium">Проверьте перед публикацией</p></>}
    {step === 4 && <><p className="text-xs text-[#616161]">Подбор → Показ → <strong className="text-black">Обсуждение</strong></p><p className="mt-3 font-semibold">Азиза · Показ состоялся</p><p className="mt-2">Квартира понравилась. Нужно уточнить условия оплаты.</p><p className="mt-3 border-t border-neutral-300 pt-3 font-medium">Связаться с собственником завтра в 10:00</p><p className="text-[#616161]">Ответственный: вы</p></>}
    {step === 5 && <><strong className="text-lg">Требуют внимания</strong><p className="mt-3 font-medium">Азиза · Обсуждение условий</p><p>Связаться с собственником сегодня.</p><p className="text-xs text-[#616161]">Ответственный: вы</p><p className="mt-3 border-t border-neutral-300 pt-3 font-medium">Тимур · После показа</p><p>Следующий контакт не назначен.</p><p className="text-xs text-[#616161]">Ответственный: агент</p></>}
  </div>
}

export function Intro() {
  const [step, setStep] = useState(0)
  const heading = useRef<HTMLHeadingElement>(null)
  function go(next: number) { setStep(next); requestAnimationFrame(() => { heading.current?.focus(); window.scrollTo({ top: 0 }) }) }
  const button = 'flex min-h-14 items-center justify-between rounded-2xl bg-black px-5 text-base font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black'
  return <main className="min-h-dvh bg-white text-black"><div className="mx-auto flex min-h-dvh max-w-[440px] flex-col px-6 pb-[max(24px,env(safe-area-inset-bottom))] pt-[max(12px,env(safe-area-inset-top))]">
    <header className="mb-5 flex min-h-11 items-center justify-between"><Link href="/intro" className="text-lg font-semibold tracking-tight">SuperApp</Link>{step < 5 && <button onClick={() => go(6)} className="min-h-11 px-2 text-sm text-[#616161]">Пропустить</button>}</header>
    {step < 6 ? <><Example step={step} /><section className="mb-6 mt-6"><h1 ref={heading} tabIndex={-1} className="text-[32px] font-semibold leading-[1.12] tracking-tight outline-none">{slides[step][0]}</h1><p className="mt-3 text-base leading-6 text-[#616161]">{slides[step][1]}</p></section><footer className="mt-auto pt-2"><div className="mb-5 flex justify-center gap-2" aria-label={`Экран ${step + 1} из 6`}>{slides.map((_, i) => <span key={i} className={`h-1.5 rounded-full ${i === step ? 'w-6 bg-black' : 'w-1.5 bg-neutral-300'}`} />)}</div><button className={`${button} w-full`} onClick={() => go(step + 1)}>{step === 5 ? 'Выбрать, как начать' : 'Далее'}<ArrowRight size={18} aria-hidden="true" /></button>{step > 0 && <button className="mt-2 min-h-11 w-full text-sm" onClick={() => go(step - 1)}>Назад</button>}</footer></> : <section><p className="mb-3 text-xs uppercase tracking-widest text-[#616161]">Знакомство завершено</p><h1 ref={heading} tabIndex={-1} className="text-[32px] font-semibold leading-tight tracking-tight outline-none">Как хотите попробовать?</h1><p className="mt-3 text-base leading-6 text-[#616161]">Два способа познакомиться с текущим прототипом.</p><Link href="/demo" className={`${button} mt-7`}>Посмотреть готовое демо<ArrowRight size={18} aria-hidden="true" /></Link><p className="mt-3 text-sm leading-6 text-[#616161]">Клиенты, объекты и сделки с примерами. Откроется текущая версия приложения.</p><Link href="/workspace" className={`${button} mt-6`}>Открыть личное пространство<ArrowRight size={18} aria-hidden="true" /></Link><p className="mt-3 text-sm leading-6 text-[#616161]">Войдите или создайте аккаунт. Настройте профиль, добавьте клиента и следующий контакт. Если вы уже начали, откроются ваши сохранённые данные.</p><div className="mt-6 rounded-2xl bg-[#f5f5f7] p-4 text-sm leading-6"><strong>Демо и ваши данные — отдельно</strong><p className="text-[#616161]">Новое личное пространство начинается без примеров. Переключение режима не удаляет сохранённые данные. Даты контактов пока не отправляют уведомления.</p></div><button onClick={() => go(5)} className="mt-4 min-h-11 text-sm underline underline-offset-4">Вернуться к знакомству</button></section>}
  </div></main>
}
