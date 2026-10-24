'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { clockLabel, dayLabel, dayOffset, taskBucket } from './dates'
import {
  type Client,
  type Deal,
  type LegalStep,
  type Property,
  type Showing,
  type Task,
  initialClients,
  initialDeals,
  initialLegalSteps,
  initialProperties,
  initialShowings,
  initialTasks,
} from './data'

export type Tab = 'home' | 'clients' | 'properties' | 'deals' | 'more'

export type Route =
  | { name: 'client'; id: string }
  | { name: 'property'; id: string }
  | { name: 'deal'; id: string }
  | { name: 'docs'; id: string }
  | { name: 'tasks'; taskId?: string }
  | { name: 'showings' }
  | { name: 'legal' }
  | { name: 'docsList' }
  | { name: 'analytics' }
  | { name: 'settings' }

export type Sheet =
  | { type: 'add' }
  | { type: 'search' }
  | { type: 'addClient'; clientId?: string }
  | { type: 'addProperty'; propertyId?: string }
  | { type: 'addTask'; clientId?: string; propertyId?: string }
  | { type: 'addShowing'; clientId?: string; propertyId?: string }
  | { type: 'call'; clientId: string; taskId?: string }
  | { type: 'outcome'; showingId: string }
  | { type: 'price'; propertyId: string }
  | { type: 'freshness'; propertyId: string }
  | { type: 'listing'; propertyId: string }
  | { type: 'payment'; dealId: string }

export interface Toast {
  id: number
  message: string
  undo?: () => void
}

export const newId = (prefix: string) => `${prefix}-${crypto.randomUUID()}`

function useStoreValue() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const refresh = () => setNow(new Date())
    const timer = setInterval(refresh, 1000)
    window.addEventListener('focus', refresh)
    return () => { clearInterval(timer); window.removeEventListener('focus', refresh) }
  }, [])
  const [clients, setClients] = useState<Client[]>(initialClients)
  const [properties, setProperties] = useState<Property[]>(initialProperties)
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [showings, setShowings] = useState<Showing[]>(initialShowings)
  const [deals, setDeals] = useState<Deal[]>(initialDeals)
  const [legal, setLegal] = useState<LegalStep[]>(initialLegalSteps)
  const [legalStatus, setLegalStatus] = useState('Работаю неофициально')
  const [role, setRole] = useState<'agent' | 'manager'>('agent')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [lang, setLang] = useState<'ru' | 'uz'>('ru')

  const [tab, setTabState] = useState<Tab>('home')
  const [stacks, setStacks] = useState<Record<Tab, Route[]>>({
    home: [],
    clients: [],
    properties: [],
    deals: [],
    more: [],
  })
  const [sheets, setSheets] = useState<Sheet[]>([])
  const [toast, setToast] = useState<Toast | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const notify = useCallback((message: string, undo?: () => void) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    const t = { id: Date.now(), message, undo }
    setToast(t)
    toastTimer.current = setTimeout(() => setToast(null), 3200)
  }, [])

  const setTab = useCallback((t: Tab) => {
    setTabState((prev) => {
      if (prev === t) setStacks((s) => ({ ...s, [t]: [] }))
      return t
    })
  }, [])

  const push = useCallback(
    (route: Route) => {
      setSheets([])
      setStacks((s) => ({ ...s, [tab]: [...s[tab], route] }))
    },
    [tab],
  )
  const pop = useCallback(() => setStacks((s) => ({ ...s, [tab]: s[tab].slice(0, -1) })), [tab])

  const openSheet = useCallback((sheet: Sheet) => setSheets((s) => [...s, sheet]), [])
  const replaceSheet = useCallback((sheet: Sheet) => setSheets((s) => [...s.slice(0, -1), sheet]), [])
  const closeSheet = useCallback(() => setSheets((s) => s.slice(0, -1)), [])
  const closeAllSheets = useCallback(() => setSheets([]), [])

  const addHistory = useCallback((clientId: string, label: string) => {
    setClients((cs) =>
      cs.map((c) =>
        c.id === clientId ? { ...c, history: [{ id: newId('h'), label, when: 'только что' }, ...c.history] } : c,
      ),
    )
  }, [])

  const completeTask = useCallback(
    (id: string) => {
      setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, done: true } : t)))
      notify('Задача выполнена', () => setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, done: false } : t))))
    },
    [notify],
  )

  const addTask = useCallback((task: Omit<Task, 'id' | 'done'>) => {
    if (!task.title.trim() || !Number.isFinite(Date.parse(task.dueAt))) throw new Error('Укажите название и корректный срок задачи')
    const t = { ...task, title: task.title.trim(), id: newId('t'), done: false }
    setTasks((ts) => [t, ...ts])
    return t
  }, [])

  const updateProperty = useCallback((id: string, patch: Partial<Property>) => {
    setProperties((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }, [])

  const updateClient = useCallback((id: string, patch: Partial<Client>) => {
    setClients((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  }, [])

  const updateShowing = useCallback((id: string, patch: Partial<Showing>) => {
    setShowings((ss) => ss.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }, [])

  const updateDeal = useCallback((id: string, patch: Partial<Deal> | ((d: Deal) => Deal)) => {
    setDeals((ds) => ds.map((d) => (d.id === id ? (typeof patch === 'function' ? patch(d) : { ...d, ...patch }) : d)))
  }, [])

  return {
    clients,
    setClients,
    properties,
    setProperties,
    now,
    tasks: tasks.map((task) => ({ ...task, bucket: taskBucket(task.dueAt, now), time: `${dayLabel(task.dueAt, now)}, ${clockLabel(task.dueAt)}` })),
    setTasks,
    showings: showings.map((showing) => ({ ...showing, day: dayOffset(showing.startsAt, now), time: clockLabel(showing.startsAt) })),
    setShowings,
    deals,
    legal,
    setLegal,
    legalStatus,
    setLegalStatus,
    role,
    setRole,
    theme,
    setTheme,
    lang,
    setLang,
    tab,
    setTab,
    stacks,
    push,
    pop,
    sheets,
    openSheet,
    replaceSheet,
    closeSheet,
    closeAllSheets,
    toast,
    notify,
    dismissToast: () => setToast(null),
    addHistory,
    completeTask,
    addTask,
    updateProperty,
    updateClient,
    updateShowing,
    updateDeal,
  }
}

type Store = ReturnType<typeof useStoreValue>
const StoreContext = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const value = useStoreValue()
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
