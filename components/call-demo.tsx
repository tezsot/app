'use client'

import { useState } from 'react'
import { Phone, PhoneOff, UserRound } from 'lucide-react'
import { Button, Group } from '@/components/ios/primitives'

const scenarios = [
  { id: 'client', title: 'Ваш клиент', name: 'Демо · Азиз', detail: 'Покупка: 2 комнаты, Юнусабад. Последний контакт: обсуждение бюджета.', source: 'Вымышленная карточка клиента', certainty: 'Связь с CRM подтверждена в сценарии' },
  { id: 'agent', title: 'Риелтор', name: 'Демо · Дилшод', detail: 'Агентство «Пример». Специализация: аренда квартир.', source: 'Вымышленная профессиональная страница', certainty: 'Роль подтверждена только в демо' },
  { id: 'unknown', title: 'Неизвестный номер', name: 'Неизвестный контакт', detail: 'Сведений нет. Уточните имя и цель звонка.', source: 'Нет источника', certainty: 'Не классифицирован' },
  { id: 'possible', title: 'Неоднозначное совпадение', name: 'Возможно, риелтор', detail: 'Номер встречается в нескольких демонстрационных объявлениях. Это не доказывает профессию владельца.', source: 'Вымышленные объявления', certainty: 'Требуется проверка' },
  { id: 'offline', title: 'Источник недоступен', name: 'Данные недоступны', detail: 'Поиск недоступен. Можно продолжить разговор без определения контакта.', source: 'Ошибка демонстрационного источника', certainty: 'Личность не установлена' },
] as const

type Phase = 'idle' | 'ringing' | 'talking' | 'summary' | 'saved'
export function CallDemo() {
  const [scenario, setScenario] = useState<string>('client')
  const [phase, setPhase] = useState<Phase>('idle')
  const [note, setNote] = useState('')
  const [outcome, setOutcome] = useState('Разговор состоялся')
  const [next, setNext] = useState('')
  const [incorrect, setIncorrect] = useState(false)
  const current = scenarios.find(item => item.id === scenario)!
  const reset = () => { setPhase('idle'); setNote(''); setNext(''); setIncorrect(false); setOutcome('Разговор состоялся') }
  return <Group header="Определитель звонков · демо">
    <div className="space-y-4 p-4">
      <p className="text-sm text-muted-foreground">Все контакты вымышлены. Кнопки не управляют телефоном. Итог хранится только на этом экране и сбрасывается при выходе.</p>
      {phase === 'idle' ? <>
        <label className="block text-sm">Сценарий<select className="mt-2 min-h-11 w-full rounded-xl border border-border bg-background px-3" value={scenario} onChange={e => setScenario(e.target.value)}>{scenarios.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
        <Button className="w-full" onClick={() => setPhase('ringing')}><Phone className="mr-2 size-4" aria-hidden="true" />Симулировать звонок</Button>
      </> : <>
        <div role="status" aria-live="polite" className="text-sm font-medium text-primary">{phase === 'ringing' ? 'Демо: входящий звонок' : phase === 'talking' ? 'Демо: разговор' : phase === 'saved' ? 'Итог демо сохранён на экране' : 'Итог звонка'}</div>
        <div className="rounded-2xl border border-border p-4">
          <UserRound className="mb-3 size-7 text-primary" aria-hidden="true" />
          <h3 className="text-lg font-semibold">{incorrect ? 'Неизвестный контакт' : current.name}</h3>
          <p className="mt-1 text-xs text-muted-foreground">Номер: DEMO-001 · не предназначен для набора</p>
          <p className="mt-3 text-sm">{incorrect ? 'Совпадение отклонено пользователем. Общая база не изменена.' : current.detail}</p>
          <p className="mt-3 text-xs text-muted-foreground">Источник: {current.source}. Актуальность не проверялась. {!incorrect && current.certainty}</p>
          {!incorrect && phase !== 'saved' && <button className="mt-2 min-h-11 text-sm text-primary" onClick={() => setIncorrect(true)}>Данные неверны</button>}
        </div>
        {phase === 'ringing' && <div className="flex flex-wrap gap-2"><Button onClick={() => setPhase('talking')}>Ответить в демо</Button><Button variant="secondary" onClick={() => { setOutcome('Отклонён'); setPhase('summary') }}><PhoneOff className="mr-2 size-4" aria-hidden="true" />Отклонить</Button></div>}
        {(phase === 'talking' || phase === 'summary') && <label className="block text-sm">Заметка<textarea maxLength={2000} value={note} onChange={e => setNote(e.target.value)} className="mt-2 min-h-24 w-full rounded-xl border border-border bg-background p-3" placeholder="Запрос и договорённости" /></label>}
        {phase === 'talking' && <Button onClick={() => setPhase('summary')}>Завершить демо-разговор</Button>}
        {phase === 'summary' && <>
          <label className="block text-sm">Результат<select value={outcome} onChange={e => setOutcome(e.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-border bg-background px-3">{['Разговор состоялся', 'Отклонён', 'Перезвонить', 'Неактуально'].map(value => <option key={value}>{value}</option>)}</select></label>
          <label className="block text-sm">Предложенный следующий шаг<input value={next} maxLength={300} onChange={e => setNext(e.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-border bg-background px-3" placeholder="Например, уточнить бюджет" /></label>
          <p className="text-xs text-muted-foreground">Это заметка сценария: клиент и задача в CRM автоматически не создаются.</p>
          <Button onClick={() => setPhase('saved')}>Сохранить итог демо</Button>
        </>}
        {phase === 'saved' && <div className="space-y-2 text-sm"><p>Результат: {outcome}</p><p className="whitespace-pre-wrap break-words">Заметка: {note || 'Не добавлена'}</p><p className="break-words">Следующий шаг: {next || 'Не указан'}</p><Button variant="secondary" onClick={reset}>Другой сценарий</Button></div>}
      </>}
    </div>
  </Group>
}
