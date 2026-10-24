import { relativeDate } from './dates'

export type Intent = 'buy' | 'rent'
export type Op = 'sale' | 'rent'
export type ClientStatus = 'new' | 'active' | 'contact' | 'closed'
export type Bucket = 'overdue' | 'today' | 'later'
export type TaskKind = 'call' | 'message' | 'showing' | 'check' | 'other'
export type Freshness = 'new' | 'confirmed' | 'recheck' | 'unavailable' | 'sold' | 'archived'
export type ShowingStatus = 'scheduled' | 'pending' | 'confirmed' | 'done' | 'moved' | 'cancelled' | 'noshow'
export type DocStatus = 'unchecked' | 'progress' | 'confirmed' | 'needs' | 'specialist'
export type PayStatus = 'expected' | 'partial' | 'paid'

export interface HistoryEvent {
  id: string
  label: string
  when: string
}

export interface Client {
  id: string
  name: string
  phone: string
  intent: Intent
  kind: string
  budgetMin?: number
  budgetMax?: number
  district?: string
  rooms?: number
  status: ClientStatus
  source: string
  note?: string
  history: HistoryEvent[]
}

export interface Task {
  id: string
  title: string
  kind: TaskKind
  clientId?: string
  propertyId?: string
  dueAt: string
  reason?: string
  done: boolean
}

export interface DocItem {
  id: string
  title: string
  why: string
  status: DocStatus
}

export interface Property {
  id: string
  op: Op
  kind: 'Квартира' | 'Дом' | 'Коммерция'
  district: string
  address: string
  price: number
  rooms?: number
  area?: number
  floor?: number
  floors?: number
  image?: string
  freshness: Freshness
  checked: string
  owner: string
  priceHistory: { label: string; price: number }[]
  docs: DocItem[]
  draft?: boolean
}

export interface Showing {
  id: string
  clientId: string
  propertyId: string
  startsAt: string
  status: ShowingStatus
  place: string
  outcome?: string
}

export interface Deal {
  id: string
  clientId: string
  propertyId: string
  type: Op
  stage: number
  next: string
  commission: {
    amount: number
    payer: string
    status: PayStatus
    received: number
    due: string
    split: { name: string; share: number }[]
  }
  history: HistoryEvent[]
}

export interface LegalStep {
  id: string
  title: string
  detail: string
  source?: string
  done: boolean
}

export const DISTRICTS = ['Юнусабад', 'Мирзо-Улугбек', 'Чиланзар', 'Яккасарай', 'Мирабад', 'Шайхантахур']

export const DEAL_STAGES = ['Контакт', 'Подбор', 'Показ', 'Переговоры', 'Договорённости', 'Закрыта']

export const FRESHNESS_LABEL: Record<Freshness, string> = {
  new: 'Только добавлен',
  confirmed: 'Актуален',
  recheck: 'Нужна проверка',
  unavailable: 'Временно недоступен',
  sold: 'Продан / сдан',
  archived: 'Архив',
}

export const SHOWING_LABEL: Record<ShowingStatus, string> = {
  scheduled: 'Запланирован',
  pending: 'Ждёт подтверждения',
  confirmed: 'Подтверждён',
  done: 'Проведён',
  moved: 'Перенесён',
  cancelled: 'Отменён',
  noshow: 'Не состоялся',
}

export const DOC_LABEL: Record<DocStatus, string> = {
  unchecked: 'Не проверено',
  progress: 'В процессе',
  confirmed: 'Подтверждено вами',
  needs: 'Нужна доп. проверка',
  specialist: 'У специалиста',
}

export const STATUS_LABEL: Record<ClientStatus, string> = {
  new: 'Новый',
  active: 'Активный',
  contact: 'Нужно связаться',
  closed: 'Закрыт',
}

const saleDocs = (): DocItem[] => [
  { id: 'd1', title: 'Кадастровый паспорт', why: 'Подтверждает характеристики и границы объекта', status: 'unchecked' },
  { id: 'd2', title: 'Право собственности', why: 'Продавец должен быть законным собственником', status: 'unchecked' },
  { id: 'd3', title: 'Паспорта собственников', why: 'Сверка личности со сведениями в документах', status: 'unchecked' },
  { id: 'd4', title: 'Согласие супруга(и)', why: 'Требуется, если объект — совместная собственность', status: 'unchecked' },
  { id: 'd5', title: 'Отсутствие обременений', why: 'Залог или арест блокируют сделку', status: 'unchecked' },
  { id: 'd6', title: 'Прописанные лица', why: 'Несовершеннолетние жильцы осложняют продажу', status: 'unchecked' },
]

export const initialClients: Client[] = [
  {
    id: 'c1',
    name: 'Дильноза Каримова',
    phone: '+998 90 123-45-67',
    intent: 'buy',
    kind: 'Квартира',
    budgetMin: 75000,
    budgetMax: 95000,
    district: 'Юнусабад',
    rooms: 3,
    status: 'contact',
    source: 'Telegram',
    note: 'Нужна школа рядом, не первый этаж',
    history: [
      { id: 'h1', label: 'Обещали перезвонить с вариантами', when: 'вчера, 18:20' },
      { id: 'h2', label: 'Первичный звонок, 6 мин', when: '21 окт' },
    ],
  },
  {
    id: 'c2',
    name: 'Азиз Рахимов',
    phone: '+998 93 555-12-08',
    intent: 'rent',
    kind: 'Квартира',
    budgetMin: 500,
    budgetMax: 700,
    district: 'Мирзо-Улугбек',
    rooms: 2,
    status: 'active',
    source: 'Звонок',
    history: [{ id: 'h3', label: 'Показ назначен на сегодня 15:00', when: 'сегодня, 09:10' }],
  },
  {
    id: 'c3',
    name: 'Шахзод Юсупов',
    phone: '+998 97 700-30-30',
    intent: 'buy',
    kind: 'Дом',
    budgetMin: 150000,
    budgetMax: 220000,
    district: 'Яккасарай',
    status: 'active',
    source: 'OLX',
    history: [{ id: 'h4', label: 'Переговоры по цене дома', when: '22 окт' }],
  },
  {
    id: 'c4',
    name: 'Малика Турсунова',
    phone: '+998 91 404-11-22',
    intent: 'buy',
    kind: 'Квартира',
    budgetMin: 55000,
    budgetMax: 70000,
    district: 'Чиланзар',
    rooms: 2,
    status: 'new',
    source: 'Instagram',
    history: [{ id: 'h5', label: 'Пропущенный звонок', when: 'сегодня, 08:42' }],
  },
  {
    id: 'c5',
    name: 'Бобур Алиев',
    phone: '+998 99 812-00-91',
    intent: 'rent',
    kind: 'Коммерция',
    budgetMin: 1200,
    budgetMax: 2000,
    district: 'Мирабад',
    status: 'active',
    source: 'Рекомендация',
    history: [{ id: 'h6', label: 'Ищет помещение под кофейню', when: '19 окт' }],
  },
  {
    id: 'c6',
    name: 'Нигора Саидова',
    phone: '+998 90 220-77-01',
    intent: 'buy',
    kind: 'Квартира',
    budgetMin: 90000,
    budgetMax: 120000,
    district: 'Мирабад',
    rooms: 3,
    status: 'closed',
    source: 'Telegram',
    history: [{ id: 'h7', label: 'Сделка закрыта', when: '2 окт' }],
  },
]

export const initialProperties: Property[] = [
  {
    id: 'p1',
    op: 'sale',
    kind: 'Квартира',
    district: 'Юнусабад',
    address: '11-квартал, ориентир — Мега Планет',
    price: 89000,
    rooms: 3,
    area: 78,
    floor: 5,
    floors: 9,
    image: '/props/p1.png',
    freshness: 'confirmed',
    checked: '2 дня назад',
    owner: 'Рустам ака',
    priceHistory: [
      { label: 'авг', price: 96000 },
      { label: 'сен', price: 92000 },
      { label: 'окт', price: 89000 },
    ],
    docs: saleDocs().map((d, i) => ({ ...d, status: i < 2 ? 'confirmed' : i === 4 ? 'needs' : 'unchecked' })),
  },
  {
    id: 'p2',
    op: 'rent',
    kind: 'Квартира',
    district: 'Мирзо-Улугбек',
    address: 'ул. Буюк Ипак Йули, 24',
    price: 650,
    rooms: 2,
    area: 56,
    floor: 7,
    floors: 12,
    image: '/props/p6.png',
    freshness: 'confirmed',
    checked: 'сегодня',
    owner: 'Сардор',
    priceHistory: [{ label: 'окт', price: 650 }],
    docs: [],
  },
  {
    id: 'p3',
    op: 'sale',
    kind: 'Дом',
    district: 'Яккасарай',
    address: 'махалля Богибустон, 6 соток',
    price: 198000,
    rooms: 5,
    area: 210,
    image: '/props/p3.png',
    freshness: 'recheck',
    checked: '24 дня назад',
    owner: 'Феруза опа',
    priceHistory: [
      { label: 'июл', price: 215000 },
      { label: 'окт', price: 198000 },
    ],
    docs: saleDocs(),
  },
  {
    id: 'p4',
    op: 'sale',
    kind: 'Квартира',
    district: 'Юнусабад',
    address: '4-квартал, ориентир — Минор',
    price: 82500,
    rooms: 3,
    area: 72,
    floor: 3,
    floors: 9,
    image: '/props/p4.png',
    freshness: 'recheck',
    checked: '18 дней назад',
    owner: 'Жасур',
    priceHistory: [{ label: 'сен', price: 82500 }],
    docs: saleDocs(),
  },
  {
    id: 'p5',
    op: 'rent',
    kind: 'Коммерция',
    district: 'Мирабад',
    address: 'ул. Тараса Шевченко, 1-й этаж',
    price: 1600,
    area: 64,
    floor: 1,
    image: '/props/p5.png',
    freshness: 'new',
    checked: 'вчера',
    owner: 'ООО «Мирабад Сити»',
    priceHistory: [{ label: 'окт', price: 1600 }],
    docs: [],
  },
  {
    id: 'p6',
    op: 'sale',
    kind: 'Квартира',
    district: 'Чиланзар',
    address: '9-квартал, ориентир — Новза',
    price: 64000,
    rooms: 2,
    area: 54,
    floor: 4,
    floors: 5,
    image: '/props/p2.png',
    freshness: 'confirmed',
    checked: '5 дней назад',
    owner: 'Ойбек',
    priceHistory: [{ label: 'окт', price: 64000 }],
    docs: saleDocs(),
  },
]

export const initialTasks: Task[] = [
  {
    id: 't1',
    title: 'Перезвонить с вариантами',
    kind: 'call',
    clientId: 'c1',
    dueAt: relativeDate(-1, '19:00'),
    reason: 'Обещали вчера — клиент ждёт',
    done: false,
  },
  {
    id: 't2',
    title: 'Ответить на пропущенный',
    kind: 'call',
    clientId: 'c4',
    dueAt: relativeDate(0, '08:42'),
    reason: 'Пропущенный звонок, новый клиент',
    done: false,
  },
  {
    id: 't3',
    title: 'Подтвердить актуальность',
    kind: 'check',
    propertyId: 'p3',
    dueAt: relativeDate(0, '12:00'),
    reason: 'Не проверялся 24 дня',
    done: false,
  },
  {
    id: 't4',
    title: 'Отправить подборку',
    kind: 'message',
    clientId: 'c5',
    dueAt: relativeDate(0, '17:30'),
    done: false,
  },
  {
    id: 't5',
    title: 'Уточнить цену у собственника',
    kind: 'call',
    propertyId: 'p4',
    dueAt: relativeDate(1, '10:00'),
    done: false,
  },
]

export const initialShowings: Showing[] = [
  { id: 's1', clientId: 'c2', propertyId: 'p2', startsAt: relativeDate(0, '15:00'), status: 'pending', place: 'У подъезда, Буюк Ипак Йули 24' },
  { id: 's2', clientId: 'c1', propertyId: 'p1', startsAt: relativeDate(1, '11:00'), status: 'confirmed', place: '11-квартал, у Мега Планет' },
  { id: 's3', clientId: 'c3', propertyId: 'p3', startsAt: relativeDate(0, '10:00'), status: 'done', place: 'У ворот дома', outcome: 'Думает' },
]

export const initialDeals: Deal[] = [
  {
    id: 'dl1',
    clientId: 'c3',
    propertyId: 'p3',
    type: 'sale',
    stage: 3,
    next: 'Согласовать цену с собственником',
    commission: {
      amount: 3960,
      payer: 'Продавец',
      status: 'expected',
      received: 0,
      due: '15 ноя',
      split: [
        { name: 'Вы', share: 60 },
        { name: 'Камола (партнёр)', share: 40 },
      ],
    },
    history: [
      { id: 'e1', label: 'Этап → Переговоры', when: '22 окт' },
      { id: 'e2', label: 'Показ проведён', when: '20 окт' },
      { id: 'e3', label: 'Согласовано 2% от цены', when: '18 окт' },
    ],
  },
  {
    id: 'dl2',
    clientId: 'c1',
    propertyId: 'p1',
    type: 'sale',
    stage: 2,
    next: 'Показ завтра в 11:00',
    commission: {
      amount: 1780,
      payer: 'Покупатель',
      status: 'expected',
      received: 0,
      due: 'ноябрь',
      split: [{ name: 'Вы', share: 100 }],
    },
    history: [{ id: 'e4', label: 'Подобран объект', when: '21 окт' }],
  },
  {
    id: 'dl3',
    clientId: 'c6',
    propertyId: 'p6',
    type: 'sale',
    stage: 5,
    next: 'Получить остаток комиссии',
    commission: {
      amount: 2400,
      payer: 'Продавец',
      status: 'partial',
      received: 1200,
      due: '30 окт',
      split: [{ name: 'Вы', share: 100 }],
    },
    history: [
      { id: 'e5', label: 'Получено $1 200', when: '3 окт' },
      { id: 'e6', label: 'Сделка закрыта у нотариуса', when: '2 окт' },
    ],
  },
]

export const LEGAL_SOURCE = 'https://lex.uz'

export const initialLegalSteps: LegalStep[] = [
  { id: 'l1', title: 'Определить правовой статус', detail: 'Индивидуальная деятельность или работа в агентстве', done: true },
  { id: 'l2', title: 'Ознакомиться с требованиями', detail: 'Актуальные нормы о риэлторской деятельности', source: LEGAL_SOURCE, done: true },
  { id: 'l3', title: 'Проверить требования к обучению', detail: 'Объём и форма обязательной подготовки', source: LEGAL_SOURCE, done: false },
  { id: 'l4', title: 'Выбрать образовательную программу', detail: 'Сравните центры: формат, язык, стоимость', done: false },
  { id: 'l5', title: 'Подготовиться к экзамену', detail: 'Тренировка по темам и пробный тест', done: false },
  { id: 'l6', title: 'Собрать документы', detail: 'Перечень по вашему статусу', done: false },
  { id: 'l7', title: 'Подать заявление', detail: 'Через установленный официальный канал', source: 'https://my.gov.uz', done: false },
  { id: 'l8', title: 'Отследить результат', detail: 'Сроки и статус рассмотрения', done: false },
  { id: 'l9', title: 'Выполнять последующие требования', detail: 'Продление, отчётность — если применимо', done: false },
]

export function money(value: number, op?: Op) {
  const v = '$' + value.toLocaleString('ru-RU').replace(/,/g, ' ')
  return op === 'rent' ? `${v}/мес` : v
}

export function compactMoney(value: number) {
  if (value >= 1000) return '$' + (value / 1000).toLocaleString('ru-RU', { maximumFractionDigits: 1 }) + 'k'
  return '$' + value
}

export function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function propertyTitle(p: Property) {
  if (p.kind === 'Квартира') return `${p.rooms ?? ''}-комн. квартира`
  if (p.kind === 'Дом') return `Дом${p.area ? `, ${p.area} м²` : ''}`
  return `Помещение${p.area ? `, ${p.area} м²` : ''}`
}

export function matchScore(c: Client, p: Property) {
  if (p.op !== (c.intent === 'buy' ? 'sale' : 'rent') || p.freshness === 'sold' || p.freshness === 'archived') return 0
  let score = 0
  const reasons: string[] = []
  if (p.kind === c.kind) {
    score += 30
    reasons.push('тип')
  }
  if (c.budgetMax && p.price <= c.budgetMax && p.price >= (c.budgetMin ?? 0) * 0.85) {
    score += 35
    reasons.push('бюджет')
  }
  if (c.district && p.district === c.district) {
    score += 25
    reasons.push('район')
  }
  if (c.rooms && p.rooms === c.rooms) {
    score += 10
    reasons.push('комнаты')
  }
  return score >= 55 ? score : 0
}

export function matchReasons(c: Client, p: Property) {
  const r: string[] = []
  if (c.district && p.district === c.district) r.push('Район')
  if (c.budgetMax && p.price <= c.budgetMax) r.push('Бюджет')
  if (c.rooms && p.rooms === c.rooms) r.push('Комнаты')
  return r
}
