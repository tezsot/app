'use client'

import {
  BarChart3,
  Bell,
  CalendarClock,
  Check,
  ChevronDown,
  Download,
  ExternalLink,
  FileCheck2,
  GraduationCap,
  Info,
  ListChecks,
  LogOut,
  Lock,
  Moon,
  Settings,
  UserCog,
} from 'lucide-react'
import { useState } from 'react'
import { Avatar, Badge, Group, Progress, Row, Screen, Segmented } from '@/components/ios/primitives'
import { AiToolsSection } from '@/components/ai-tools'
import { CallDemo } from '@/components/call-demo'
import { DOC_LABEL, type DocStatus, propertyTitle } from '@/lib/data'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors duration-200',
        checked ? 'bg-success' : 'bg-input',
      )}
    >
      <span
        className={cn(
          'absolute top-[2px] left-[2px] size-[27px] rounded-full bg-white shadow-[0_3px_8px_rgb(0_0_0/0.15)] transition-transform duration-200',
          checked && 'translate-x-5',
        )}
      />
    </button>
  )
}

export function MoreScreen() {
  const s = useStore()
  const open = s.tasks.filter((t) => !t.done).length
  const legalDone = s.legal.filter((l) => l.done).length
  return (
    <Screen title="Ещё">
      <Group>
        <Row
          leading={<Avatar name="Камрон Тошев" size={52} />}
          title={<span className="text-[18px] font-semibold">Камрон Тошев</span>}
          subtitle={`${s.role === 'manager' ? 'Руководитель' : 'Агент'} · Агентство «Уй Жой»`}
          onClick={() => s.push({ name: 'settings' })}
          className="min-h-[72px]"
        />
      </Group>
      <Group><Row icon={GraduationCap} title="Достижения" subtitle="Демо · задания, coins и награды" onClick={() => s.push({ name: 'rewards' })} /></Group>
      <AiToolsSection />
      <CallDemo />
      <Group><Row icon={BarChart3} title="Аналитика рынка" subtitle="Демо · цены, районы и доходность" onClick={() => s.push({ name: 'market' })} /></Group>
      <Group header="Работа">
        <Row icon={ListChecks} tone="dark" title="Задачи" value={open} onClick={() => s.push({ name: 'tasks' })} />
        <Row
          icon={CalendarClock}
          tone="dark"
          title="Показы"
          value={s.showings.filter((x) => x.day <= 1 && x.status !== 'done').length}
          onClick={() => s.push({ name: 'showings' })}
        />
        <Row icon={FileCheck2} tone="dark" title="Проверка документов" onClick={() => s.push({ name: 'docsList' })} />
        <Row
          icon={BarChart3}
          tone="dark"
          title={s.role === 'manager' ? 'Аналитика команды' : 'Моя статистика'}
          onClick={() => s.push({ name: 'analytics' })}
        />
      </Group>
      <Group header="Профессиональный рост">
        <Row
          icon={GraduationCap}
          tone="dark"
          title="Маршрут легализации"
          subtitle={s.legalStatus}
          value={`${legalDone}/${s.legal.length}`}
          onClick={() => s.push({ name: 'legal' })}
        />
      </Group>
      <Group>
        <Row icon={Settings} title="Настройки" onClick={() => s.push({ name: 'settings' })} />
      </Group>
    </Screen>
  )
}

const LEGAL_STATUSES = ['Работаю неофициально', 'Готовлюсь к обучению', 'Прохожу обучение', 'Подаю документы', 'Работаю официально']

export function LegalScreen() {
  const s = useStore()
  const [statusOpen, setStatusOpen] = useState(false)
  const done = s.legal.filter((l) => l.done).length
  const pct = (done / s.legal.length) * 100
  const nextIdx = s.legal.findIndex((l) => !l.done)

  return (
    <Screen title="Легализация" back onBack={s.pop}>
      <section className="px-4 pb-6">
        <div className="rounded-[24px] bg-card p-5">
          <div className="flex items-center gap-4">
            <div className="relative size-[72px] shrink-0">
              <svg viewBox="0 0 36 36" className="size-full -rotate-90" aria-hidden>
                <circle cx="18" cy="18" r="15.5" fill="none" className="stroke-secondary" strokeWidth="3.5" />
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  className="stroke-primary transition-[stroke-dashoffset] duration-500"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray={97.4}
                  strokeDashoffset={97.4 - (97.4 * pct) / 100}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[17px] font-bold tabular-nums">
                {done}/{s.legal.length}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] text-muted-foreground">Текущий статус</p>
              <button
                type="button"
                onClick={() => setStatusOpen((v) => !v)}
                aria-expanded={statusOpen}
                className="flex items-center gap-1 text-left text-[17px] font-semibold"
              >
                {s.legalStatus}
                <ChevronDown className={cn('size-4 transition-transform', statusOpen && 'rotate-180')} aria-hidden />
              </button>
            </div>
          </div>
          {statusOpen && (
            <div className="anim-fade mt-4 flex flex-col overflow-hidden rounded-[16px] bg-secondary">
              {LEGAL_STATUSES.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    s.setLegalStatus(st)
                    setStatusOpen(false)
                  }}
                  className="flex min-h-11 items-center justify-between border-b border-separator px-4 text-left text-[15px] last:border-b-0"
                >
                  {st}
                  {s.legalStatus === st && <Check className="size-4" strokeWidth={2.5} aria-hidden />}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <Group header="Шаги" footer="Отмечайте шаги по мере прохождения. Порядок рекомендуемый, не обязательный.">
        <ol>
          {s.legal.map((l, i) => (
            <li key={l.id} className="group/row flex gap-3 pl-4">
              <button
                type="button"
                aria-label={l.done ? `Снять отметку: ${l.title}` : `Отметить выполненным: ${l.title}`}
                onClick={() => s.setLegal((ls) => ls.map((x) => (x.id === l.id ? { ...x, done: !x.done } : x)))}
                className="-ml-1.5 flex size-11 shrink-0 items-center justify-center self-start pt-1"
              >
                <span
                  className={cn(
                    'flex size-[26px] items-center justify-center rounded-full text-[12px] font-semibold transition-colors',
                    l.done
                      ? 'bg-primary text-primary-foreground'
                      : i === nextIdx
                        ? 'ring-2 ring-primary'
                        : 'ring-1 ring-muted-foreground/40 text-muted-foreground',
                  )}
                >
                  {l.done ? <Check className="anim-pop size-3.5" strokeWidth={3} aria-hidden /> : i + 1}
                </span>
              </button>
              <div className="min-w-0 flex-1 border-b border-separator py-3 pr-4 group-last/row:border-b-0">
                <p className={cn('text-[16px] font-medium', l.done && 'text-muted-foreground')}>{l.title}</p>
                <p className="text-[13px] leading-snug text-muted-foreground">{l.detail}</p>
                {i === nextIdx && <Badge kind="dark" className="mt-1.5">Следующий шаг</Badge>}
                {l.source && (
                  <a
                    href={l.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 flex items-center gap-1 text-[13px] font-medium underline-offset-2 hover:underline"
                  >
                    Источник: {new URL(l.source).host}
                    <ExternalLink className="size-3" aria-hidden />
                  </a>
                )}
              </div>
            </li>
          ))}
        </ol>
      </Group>

      <section className="px-4 pb-6">
        <div className="flex gap-3 rounded-[22px] bg-card p-4">
          <Info className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
          <div>
            <p className="text-[15px] font-medium">Демо-материал · юридическая проверка не проведена</p>
            <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground">
              Требования могут меняться. Перед подачей проверьте актуальную редакцию на официальном ресурсе. Приложение
              не оказывает юридических услуг.
            </p>
          </div>
        </div>
      </section>
    </Screen>
  )
}

const DOC_STATUSES: DocStatus[] = ['unchecked', 'progress', 'confirmed', 'needs', 'specialist']
const docKind = (st: DocStatus): 'success' | 'warning' | 'dark' | 'outline' | 'neutral' =>
  st === 'confirmed' ? 'success' : st === 'needs' ? 'warning' : st === 'specialist' ? 'dark' : st === 'progress' ? 'outline' : 'neutral'

export function DocsScreen({ id }: { id: string }) {
  const s = useStore()
  const [open, setOpen] = useState<string | null>(null)
  const p = s.properties.find((x) => x.id === id)
  if (!p) return null
  const confirmed = p.docs.filter((d) => d.status === 'confirmed').length

  const setStatus = (docId: string, status: DocStatus) => {
    s.updateProperty(p.id, { docs: p.docs.map((d) => (d.id === docId ? { ...d, status } : d)) })
    setOpen(null)
  }

  return (
    <Screen title="Документы" subtitle={`${propertyTitle(p)} · ${p.district}`} back onBack={s.pop}>
      <div className="px-4 pb-6">
        <div className="rounded-[22px] bg-card p-4">
          <div className="flex items-baseline justify-between">
            <p className="text-[17px] font-semibold">Подтверждено вами</p>
            <p className="text-[17px] font-semibold tabular-nums">
              {confirmed} из {p.docs.length}
            </p>
          </div>
          <Progress value={(confirmed / p.docs.length) * 100} className="mt-3" />
        </div>
      </div>
      <Group header="Чек-лист продажи">
        {p.docs.map((d) => (
          <div key={d.id} className="border-b border-separator last:border-b-0">
            <button
              type="button"
              onClick={() => setOpen(open === d.id ? null : d.id)}
              aria-expanded={open === d.id}
              className="flex min-h-[60px] w-full items-center gap-3 px-4 py-3 text-left active:bg-accent"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-[16px]">{d.title}</span>
                <span className="mt-1 block">
                  <Badge kind={docKind(d.status)}>{DOC_LABEL[d.status]}</Badge>
                </span>
              </span>
              <ChevronDown
                className={cn('size-4 text-muted-foreground transition-transform', open === d.id && 'rotate-180')}
                aria-hidden
              />
            </button>
            {open === d.id && (
              <div className="anim-fade px-4 pb-4">
                <p className="text-[13px] leading-snug text-muted-foreground">
                  <span className="font-medium text-foreground">Зачем: </span>
                  {d.why}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {DOC_STATUSES.map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatus(d.id, st)}
                      aria-pressed={d.status === st}
                      className={cn(
                        'press h-9 rounded-full px-3 text-[13px] font-medium',
                        d.status === st ? 'bg-primary text-primary-foreground' : 'bg-secondary',
                      )}
                    >
                      {DOC_LABEL[st]}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </Group>
      <p className="px-8 text-center text-[12px] leading-snug text-muted-foreground">
        Это личный чек-лист, а не юридическое заключение. При сомнениях передайте документы нотариусу или юристу.
      </p>
    </Screen>
  )
}

export function DocsListScreen() {
  const s = useStore()
  const list = s.properties.filter((p) => p.op === 'sale' && p.docs.length)
  return (
    <Screen title="Документы" back onBack={s.pop}>
      <Group header="Объекты на продажу">
        {list.map((p) => {
          const c = p.docs.filter((d) => d.status === 'confirmed').length
          return (
            <Row
              key={p.id}
              leading={
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image} alt="" className="size-11 shrink-0 rounded-[10px] object-cover" />
              }
              title={propertyTitle(p)}
              subtitle={
                <span className="flex items-center gap-2">
                  <Progress value={(c / p.docs.length) * 100} className="w-20" />
                  <span className="tabular-nums">
                    {c}/{p.docs.length}
                  </span>
                  {p.docs.some((d) => d.status === 'needs') && <Badge kind="warning">Доп. проверка</Badge>}
                </span>
              }
              onClick={() => s.push({ name: 'docs', id: p.id })}
            />
          )
        })}
      </Group>
    </Screen>
  )
}

const TEAM = [
  { name: 'Камрон Тошев', clients: 6, deals: 3, overdue: 1 },
  { name: 'Камола Ахмедова', clients: 9, deals: 4, overdue: 0 },
  { name: 'Улугбек Назаров', clients: 4, deals: 1, overdue: 3 },
]

export function AnalyticsScreen() {
  const s = useStore()
  const manager = s.role === 'manager'
  const funnel = [
    { label: 'Обращения', value: manager ? 48 : 19 },
    { label: 'Показы', value: manager ? 22 : 8 },
    { label: 'Переговоры', value: manager ? 11 : 4 },
    { label: 'Закрыто', value: manager ? 6 : 2 },
  ]
  return (
    <Screen title={manager ? 'Команда' : 'Статистика'} subtitle="Октябрь 2026" back onBack={s.pop}>
      <div className="grid grid-cols-2 gap-2 px-4 pb-6">
        {[
          { label: 'Конверсия в сделку', value: manager ? '12,5%' : '10,5%' },
          { label: 'Ожидаемая комиссия', value: manager ? '$18,4k' : '$4,9k' },
          { label: 'Ср. время ответа', value: manager ? '42 мин' : '28 мин' },
          { label: 'Просрочено', value: manager ? '4' : '1', warn: true },
        ].map((k) => (
          <div key={k.label} className="rounded-[22px] bg-card p-4">
            <p className="text-[13px] leading-snug text-muted-foreground">{k.label}</p>
            <p className={cn('mt-1 text-[24px] font-bold tabular-nums', k.warn && 'text-destructive')}>{k.value}</p>
          </div>
        ))}
      </div>
      <Group header="Воронка">
        <div className="flex flex-col gap-3 p-4">
          {funnel.map((f) => (
            <div key={f.label}>
              <div className="flex justify-between text-[14px]">
                <span>{f.label}</span>
                <span className="font-semibold tabular-nums">{f.value}</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-primary" style={{ width: `${(f.value / funnel[0].value) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Group>
      {manager ? (
        <Group header="Агенты" footer="Персональные данные клиентов агентов скрыты — видны только метрики">
          {TEAM.map((t) => (
            <Row
              key={t.name}
              leading={<Avatar name={t.name} size={36} />}
              title={t.name}
              subtitle={`${t.clients} клиентов · ${t.deals} сделки`}
              trailing={t.overdue > 0 ? <Badge kind="danger">{t.overdue} просрочено</Badge> : <Badge kind="success">В порядке</Badge>}
            />
          ))}
        </Group>
      ) : (
        <Group footer="Командная аналитика доступна в роли руководителя (Настройки)">
          <Row icon={Lock} title="Аналитика команды" subtitle="Только для руководителя" />
        </Group>
      )}
    </Screen>
  )
}

export function SettingsScreen() {
  const s = useStore()
  const [push, setPush] = useState(true)
  const [quiet, setQuiet] = useState(true)
  const [faceId, setFaceId] = useState(true)

  return (
    <Screen title="Настройки" back onBack={s.pop}>
      <div className="flex flex-col items-center pb-6">
        <Avatar name="Камрон Тошев" size={80} />
        <p className="mt-3 text-[22px] font-semibold">Камрон Тошев</p>
        <p className="text-[15px] text-muted-foreground tabular-nums">+998 90 000-11-22</p>
      </div>

      <Group header="Роль" footer="Руководитель видит метрики команды и распределяет клиентов">
        <div className="p-3">
          <Segmented
            value={s.role}
            onChange={(v) => {
              s.setRole(v)
              s.notify(v === 'manager' ? 'Режим руководителя' : 'Режим агента')
            }}
            options={[
              { value: 'agent', label: 'Агент' },
              { value: 'manager', label: 'Руководитель' },
            ]}
          />
        </div>
      </Group>

      <Group header="Оформление">
        <Row
          icon={Moon}
          title="Тёмная тема"
          trailing={<Toggle label="Тёмная тема" checked={s.theme === 'dark'} onChange={(v) => s.setTheme(v ? 'dark' : 'light')} />}
        />
        <div className="flex items-center gap-3 py-2 pr-3 pl-4">
          <span className="flex-1 text-[16px]">Язык</span>
          <Segmented
            className="w-40"
            value={s.lang}
            onChange={(v) => {
              s.setLang(v)
              if (v === 'uz') s.notify("O'zbek tili — скоро")
            }}
            options={[
              { value: 'ru', label: 'Рус' },
              { value: 'uz', label: "O'zb" },
            ]}
          />
        </div>
      </Group>

      <Group header="Уведомления" footer="Тихий режим: не беспокоить с 22:00 до 08:00, кроме показов на утро">
        <Row icon={Bell} title="Напоминания" trailing={<Toggle label="Напоминания" checked={push} onChange={setPush} />} />
        <Row
          icon={CalendarClock}
          title="Тихий режим"
          trailing={<Toggle label="Тихий режим" checked={quiet} onChange={setQuiet} />}
        />
      </Group>

      <Group header="Безопасность и данные">
        <Row icon={Lock} title="Вход по Face ID" trailing={<Toggle label="Face ID" checked={faceId} onChange={setFaceId} />} />
        <Row icon={UserCog} title="Кто видит мои данные" value="Вы и руководитель" />
        <Row icon={Download} title="Экспорт данных" onClick={() => s.notify('Экспорт подготовлен')} />
      </Group>

      <Group>
        <Row icon={LogOut} tone="danger" title="Выйти" destructive onClick={() => s.notify('Демо: выход отключён')} chevron={false} />
      </Group>
      <p className="text-center text-[12px] text-muted-foreground">Маклер 1.0 · прототип</p>
    </Screen>
  )
}
