'use client'

import { useState } from 'react'
import { UserCheck } from 'lucide-react'

export function ProfileIntro({ onComplete }: { onComplete: (name: string) => void }) {
  const [scenario, setScenario] = useState('found')
  const [verified, setVerified] = useState(false)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [agency, setAgency] = useState('')
  const [includeAgency, setIncludeAgency] = useState(true)
  const [ready, setReady] = useState(false)
  const inputClass = 'mt-1 min-h-11 w-full rounded-xl border border-border bg-background px-3 text-base'
  const buttonClass = 'min-h-11 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground'
  function choose(person: string) { setName(person); setCity('Ташкент'); setAgency('Демо Агентство'); setEditing(true) }
  function manual() { setName(''); setCity(''); setAgency(''); setEditing(true) }
  return <section className="space-y-4">
    <p className="text-xs font-semibold text-primary">ДЕМО · ВЫМЫШЛЕННЫЕ ПРОФИЛИ</p>
    <h1 className="text-3xl font-semibold tracking-tight">{ready ? `${name.trim()}, всё готово` : 'Познакомимся ближе'}</h1>
    {ready ? <>
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5"><UserCheck aria-hidden className="mb-3 size-8 text-primary" /><p className="font-semibold">{name.trim()}</p><p className="text-sm text-muted-foreground">{city.trim() || 'Город не указан'}</p>{includeAgency && agency.trim() && <p className="text-sm">{agency.trim()}</p>}<p className="mt-3 text-xs text-muted-foreground">Профиль показан для проверки. Он не записан в базу и не меняет данные CRM.</p></div>
      <button className={buttonClass} onClick={() => onComplete(name.trim())}>Выбрать первый шаг</button>
      <button className="ml-3 min-h-11 text-sm text-primary" onClick={() => setReady(false)}>Исправить</button>
    </> : <>
      <p className="text-sm text-muted-foreground">Посмотрите, как будет выглядеть знакомство по номеру. Реальные номера не вводятся, SMS не отправляются.</p>
      {!verified ? <>
        <label className="block text-sm">Демо-сценарий<select value={scenario} onChange={e => setScenario(e.target.value)} className={inputClass}><option value="found">Профиль найден</option><option value="multiple">Несколько совпадений</option><option value="none">Ничего не найдено</option><option value="error">Источник недоступен</option></select></label>
        <div className="rounded-2xl bg-card p-4"><p className="text-xs text-muted-foreground">Тестовый номер · не используется для связи</p><p className="mt-1 font-mono">+998 •• ••• •• 01</p></div>
        <button className={buttonClass} onClick={() => { setVerified(true); if (scenario === 'none' || scenario === 'error') manual() }}>Симулировать подтверждение</button>
      </> : <>
        <p role="status" className="text-sm text-muted-foreground">{scenario === 'none' ? 'Совпадений нет. Заполните профиль самостоятельно.' : scenario === 'error' ? 'Источник недоступен. Можно продолжить вручную.' : 'Демо-подтверждение выполнено. Проверьте совпадение.'}</p>
        {!editing ? <div className="space-y-3">{(scenario === 'multiple' ? ['Азиз Каримов', 'Азиз Рахимов'] : ['Азиз Каримов']).map(person => <div key={person} className="rounded-2xl border border-border bg-card p-4"><h2 className="font-semibold">{person}</h2><p className="text-sm">Ташкент · Демо Агентство</p><p className="mt-2 text-xs text-muted-foreground">Источник: смоделированное объявление. Актуальность не проверена. Связь с соцсетями не подтверждена.</p><button className={`${buttonClass} mt-3`} onClick={() => choose(person)}>Это я — {person}</button></div>)}<button className="min-h-11 text-sm text-primary" onClick={manual}>Это не мой профиль — заполнить вручную</button></div> : <form className="space-y-3" onSubmit={e => { e.preventDefault(); if (name.trim()) setReady(true) }}>
          <label className="block text-sm">Как вас зовут<input required maxLength={80} value={name} onChange={e => setName(e.target.value)} autoComplete="off" className={inputClass} /></label>
          <label className="block text-sm">Город<input maxLength={80} value={city} onChange={e => setCity(e.target.value)} className={inputClass} /></label>
          <label className="block text-sm">Агентство, необязательно<input maxLength={100} value={agency} onChange={e => setAgency(e.target.value)} className={inputClass} /></label>
          <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" checked={includeAgency} onChange={e => setIncludeAgency(e.target.checked)} />Использовать агентство в демо-профиле</label>
          <button disabled={!name.trim()} className={`${buttonClass} disabled:opacity-40`}>Подтвердить данные</button>
        </form>}
        <button className="min-h-11 text-sm text-muted-foreground" onClick={() => { setVerified(false); setEditing(false); setName(''); setCity(''); setAgency(''); setIncludeAgency(true) }}>Другой демо-сценарий</button>
      </>}
      <button className="block min-h-11 text-sm text-primary" onClick={() => onComplete('')}>Продолжить без профиля</button>
    </>}
  </section>
}
