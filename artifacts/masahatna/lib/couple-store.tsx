'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { doc, onSnapshot, setDoc, type DocumentData } from 'firebase/firestore'
import { getToken, onMessage } from 'firebase/messaging'
import { db, COUPLE_DOC_PATH, VAPID_KEY, getMessagingIfSupported } from './firebase'

export type Partner = 'Moe' | 'Rio'
export const PARTNERS: Partner[] = ['Moe', 'Rio']

export type ThemeName = 'paper' | 'night' | 'sea' | 'dusk'

export type MoodEntry = { mood: string; energy: number; note: string }
export type Activity = {
  id: number
  title: string
  assignee: Partner | 'معاً'
  category: string
  completed: boolean
}
export type Message = {
  id: number
  from: Partner
  text: string
  time: string
  hearts: number
}
export type Memory = { id: number; src: string; caption: string; date: string; by: Partner }

export type Settings = {
  theme: ThemeName
  partnerA: string | null
  partnerB: string | null
  fontSize: number
  brightness: number
}

const DEFAULT_SETTINGS: Settings = {
  theme: 'paper',
  partnerA: null,
  partnerB: null,
  fontSize: 16,
  brightness: 100,
}

const SETTINGS_KEY = 'masahatna-settings'
const DATA_KEY = 'masahatna-data'

const MEMORIES: Memory[] = [
  // Memories are user content and must not be seeded with sample photos.
]

const DEFAULT_MOODS: Record<Partner, MoodEntry> = {
  Moe: { mood: '', energy: 50, note: '' },
  Rio: { mood: '', energy: 50, note: '' },
}

const DEFAULT_ACTIVITIES: Activity[] = []
const DEFAULT_MESSAGES: Message[] = []

type LastAction = {
  id: string
  by: Partner
  title: string
  body: string
} | null

type PersistedData = {
  moods: Record<Partner, MoodEntry>
  activities: Activity[]
  messages: Message[]
  tokens?: Partial<Record<Partner, string>>
  lastAction?: LastAction
}

type Store = {
  currentUser: Partner
  setCurrentUser: (p: Partner) => void
  moods: Record<Partner, MoodEntry>
  saveMood: (entry: MoodEntry) => void
  activities: Activity[]
  addActivity: (a: Omit<Activity, 'id' | 'completed'>) => void
  toggleActivity: (id: number) => void
  deleteActivity: (id: number) => void
  messages: Message[]
  sendMessage: (text: string) => void
  heartMessage: (id: number) => void
  memories: Memory[]
  settings: Settings
  updateSettings: (patch: Partial<Settings>) => void
  resetSettings: () => void
  toast: string | null
  notify: (msg: string) => void
  notificationsEnabled: boolean
  notificationsSupported: boolean
  enableNotifications: () => Promise<void>
}

const CoupleContext = createContext<Store | null>(null)

const docRef = doc(db, ...COUPLE_DOC_PATH)

function makeLastAction(by: Partner, title: string, body: string): NonNullable<LastAction> {
  return { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, by, title, body }
}

function getErrorCode(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null || !('code' in error)) return undefined
  return typeof error.code === 'string' ? error.code : undefined
}

export function CoupleProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Partner>('Moe')
  const [moods, setMoods] = useState<Record<Partner, MoodEntry>>(DEFAULT_MOODS)
  const [activities, setActivities] = useState<Activity[]>(DEFAULT_ACTIVITIES)
  const [messages, setMessages] = useState<Message[]>(DEFAULT_MESSAGES)
  const [tokens, setTokens] = useState<Partial<Record<Partner, string>>>({})
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [toast, setToast] = useState<string | null>(null)
  const [notificationsSupported, setNotificationsSupported] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [hydrated, setHydrated] = useState(false)
  // Keep a live copy of the latest state in refs so action creators (memoized once via
  // useCallback below isn't needed here since `value` is rebuilt each render) always
  // read fresh data when computing writes — avoids stale-closure bugs with Firestore.
  const stateRef = useRef({ moods, activities, messages, tokens, currentUser })
  stateRef.current = { moods, activities, messages, tokens, currentUser }

  // 1. Load the local cache before starting Firestore synchronization.
  useEffect(() => {
    try {
      const rawSettings = localStorage.getItem(SETTINGS_KEY)
      if (rawSettings) {
        const parsed: unknown = JSON.parse(rawSettings)
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          setSettings({ ...DEFAULT_SETTINGS, ...parsed })
        }
      }
    } catch {}
    try {
      const rawData = localStorage.getItem(DATA_KEY)
      if (rawData) {
        const parsed: Partial<PersistedData> = JSON.parse(rawData)
        if (parsed.moods) setMoods({ ...DEFAULT_MOODS, ...parsed.moods })
        if (Array.isArray(parsed.activities)) setActivities(parsed.activities)
        if (Array.isArray(parsed.messages)) setMessages(parsed.messages)
      }
    } catch {}
    setHydrated(true)
  }, [])

  // 2. Real-time sync: whichever partner's device changes something, the other partner's
  // screen updates live through this Firestore document — this is what makes it "shared"
  // across two phones instead of just two tabs on the same browser.
  useEffect(() => {
    if (!hydrated) return
    const unsubscribe = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as DocumentData
          if (data.moods && typeof data.moods === 'object') {
            const nextMoods = { ...DEFAULT_MOODS, ...data.moods }
            stateRef.current = { ...stateRef.current, moods: nextMoods }
            setMoods(nextMoods)
          }
          if (Array.isArray(data.activities)) {
            stateRef.current = { ...stateRef.current, activities: data.activities }
            setActivities(data.activities)
          }
          if (Array.isArray(data.messages)) {
            stateRef.current = { ...stateRef.current, messages: data.messages }
            setMessages(data.messages)
          }
          if (data.tokens && typeof data.tokens === 'object') {
            stateRef.current = { ...stateRef.current, tokens: data.tokens }
            setTokens(data.tokens)
          }
        } else {
          // First time ever opening the app on either phone: seed the shared doc.
          setDoc(docRef, {
            moods: stateRef.current.moods,
            activities: stateRef.current.activities,
            messages: stateRef.current.messages,
          }).catch(() => setToast('تعذر إنشاء مساحة المزامنة — تحقّق من إعدادات Firebase'))
        }
      },
      () => {
        setToast('تعذر الاتصال بمساحة المزامنة — تحقق من الإنترنت أو قواعد Firebase')
      },
    )
    return () => unsubscribe()
  }, [hydrated])

  // 3. Cache the shared data locally too, so a reload while offline still shows real content.
  useEffect(() => {
    if (!hydrated) return
    try {
      // Device tokens must only come from Firestore; local cache can otherwise
      // make an unsaved or stale token look like notifications are enabled.
      const data: PersistedData = { moods, activities, messages }
      localStorage.setItem(DATA_KEY, JSON.stringify(data))
    } catch {}
  }, [moods, activities, messages, hydrated])

  useEffect(() => {
    getMessagingIfSupported()
      .then((m) => setNotificationsSupported(!!m))
      .catch(() => setNotificationsSupported(false))
  }, [])

  // Firebase delivers the data-only notification to the app service worker in the
  // BACKGROUND. When the app is open and focused,
  // we have to show it ourselves — otherwise a push that arrives while you're
  // looking at the screen produces nothing at all.
  useEffect(() => {
    let unsubscribe: (() => void) | undefined
    getMessagingIfSupported().then((messaging) => {
      if (!messaging) return
      unsubscribe = onMessage(messaging, (payload) => {
        const title = payload.data?.title || payload.notification?.title || 'مساحتنا'
        const body = payload.data?.body || payload.notification?.body || ''
        setToast(body ? `${title}: ${body}` : title)
        if (toastTimer.current) clearTimeout(toastTimer.current)
        toastTimer.current = setTimeout(() => setToast(null), 2600)
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          navigator.serviceWorker
            ?.getRegistration()
            .then((reg) => reg?.showNotification(title, { body, icon: '/icons/icon-192.png' }))
            .catch(() => {})
        }
      })
    })
    return () => unsubscribe?.()
  }, [])

  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = settings.theme
    root.style.setProperty('--app-font-size', `${settings.fontSize}px`)
    if (settings.partnerA) root.style.setProperty('--partner-a', settings.partnerA)
    else root.style.removeProperty('--partner-a')
    if (settings.partnerB) root.style.setProperty('--partner-b', settings.partnerB)
    else root.style.removeProperty('--partner-b')
    document.body.style.filter = settings.brightness === 100 ? '' : `brightness(${settings.brightness}%)`
    if (hydrated) {
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
      } catch {}
    }
  }, [settings, hydrated])

  const notify = useCallback((msg: string) => {
    setToast(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2600)
  }, [])

  const push = useCallback((patch: Partial<PersistedData>) => {
    setDoc(docRef, patch, { merge: true }).catch(() => {
      notify('تعذر مزامنة التغيير — تأكد من الاتصال بالإنترنت')
    })
  }, [notify])

  const enableNotifications = useCallback(async () => {
    if (typeof window.Notification === 'undefined' || !('serviceWorker' in navigator) || !window.isSecureContext) {
      notify('الإشعارات تحتاج متصفحًا يدعمها واتصالًا آمنًا')
      return
    }

    if (window.top !== window.self) {
      notify('افتح مساحتنا في تبويب مستقل ثم أعد تفعيل الإشعارات')
      return
    }

    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        notify(
          permission === 'denied'
            ? 'إشعارات هذا الموقع محظورة في إعدادات المتصفح. اسمح بها ثم أعد المحاولة'
            : 'لم تسمح للمتصفح بإرسال الإشعارات',
        )
        return
      }

      const messaging = await getMessagingIfSupported()
      if (!messaging) {
        notify('خدمة الإشعارات غير متاحة في هذا المتصفح')
        return
      }

      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
      await navigator.serviceWorker.ready
      const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: registration })
      if (!token) {
        notify('تعذر تفعيل الإشعارات، حاول مرة ثانية')
        return
      }

      const partner = stateRef.current.currentUser
      const nextTokens = { ...stateRef.current.tokens, [partner]: token }
      await setDoc(docRef, { tokens: nextTokens }, { merge: true })
      stateRef.current = { ...stateRef.current, tokens: nextTokens }
      setTokens(nextTokens)
      notify('تم تفعيل الإشعارات على هذا الجهاز')
    } catch (error) {
      console.error('Notification activation failed:', error)
      const code = getErrorCode(error)
      if (code?.startsWith('firestore/')) {
        notify('تم إنشاء رمز الإشعارات لكن تعذر حفظه في مساحة المزامنة. تحقق من الاتصال ثم أعد المحاولة')
      } else if (code?.includes('service-worker')) {
        notify('تعذر تثبيت خدمة الإشعارات. افتح التطبيق في تبويب مستقل ثم أعد المحاولة')
      } else if (code?.startsWith('messaging/')) {
        notify(`تعذر تسجيل هذا الجهاز لدى Firebase (${code})`)
      } else {
        notify('تعذر تفعيل الإشعارات. أعد المحاولة؛ سُجّل سبب الخطأ في سجل المتصفح')
      }
    }
  }, [notify])

  const value = useMemo<Store>(
    () => ({
      currentUser,
      setCurrentUser: (partner) => {
        stateRef.current = { ...stateRef.current, currentUser: partner }
        setCurrentUser(partner)
      },
      moods,
      saveMood: (entry) => {
        const current = stateRef.current
        const next = { ...current.moods, [current.currentUser]: entry }
        stateRef.current = { ...current, moods: next }
        setMoods(next)
        push({
          moods: next,
          lastAction: makeLastAction(
            current.currentUser,
            'مزاج جديد',
            `${current.currentUser} حدّث مزاجه إلى ${entry.mood}`,
          ),
        })
      },
      activities,
      addActivity: (a) => {
        const current = stateRef.current
        const next = [{ ...a, id: Date.now(), completed: false }, ...current.activities]
        stateRef.current = { ...current, activities: next }
        setActivities(next)
        push({
          activities: next,
          lastAction: makeLastAction(current.currentUser, 'مهمة جديدة', `${current.currentUser} أضاف: ${a.title}`),
        })
      },
      toggleActivity: (id) => {
        const current = stateRef.current
        const target = current.activities.find((a) => a.id === id)
        const next = current.activities.map((a) => (a.id === id ? { ...a, completed: !a.completed } : a))
        stateRef.current = { ...current, activities: next }
        setActivities(next)
        if (target) {
          const willComplete = !target.completed
          push({
            activities: next,
            lastAction: makeLastAction(
              current.currentUser,
              'تحديث مهمة',
              `${current.currentUser} ${willComplete ? 'أنجز' : 'أعاد فتح'}: ${target.title}`,
            ),
          })
        } else {
          push({ activities: next })
        }
      },
      deleteActivity: (id) => {
        const current = stateRef.current
        const target = current.activities.find((a) => a.id === id)
        const next = current.activities.filter((a) => a.id !== id)
        stateRef.current = { ...current, activities: next }
        setActivities(next)
        push({
          activities: next,
          ...(target
            ? {
                lastAction: makeLastAction(
                  current.currentUser,
                  'حذف مهمة',
                  `${current.currentUser} حذف: ${target.title}`,
                ),
              }
            : {}),
        })
      },
      messages,
      sendMessage: (text) => {
        const current = stateRef.current
        const next = [
          ...current.messages,
          {
            id: Date.now(),
            from: current.currentUser,
            text,
            hearts: 0,
            time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
          },
        ]
        stateRef.current = { ...current, messages: next }
        setMessages(next)
        push({
          messages: next,
          lastAction: makeLastAction(
            current.currentUser,
            `رسالة من ${current.currentUser}`,
            text.slice(0, 120),
          ),
        })
      },
      heartMessage: (id) => {
        const current = stateRef.current
        const next = current.messages.map((m) => (m.id === id ? { ...m, hearts: m.hearts + 1 } : m))
        stateRef.current = { ...current, messages: next }
        setMessages(next)
        const target = current.messages.find((m) => m.id === id)
        push({
          messages: next,
          ...(target
            ? {
                lastAction: makeLastAction(
                  current.currentUser,
                  'إعجاب برسالة',
                  `${current.currentUser} أعجب برسالتك`,
                ),
              }
            : {}),
        })
      },
      memories: MEMORIES,
      settings,
      updateSettings: (patch) => setSettings((s) => ({ ...s, ...patch })),
      resetSettings: () => setSettings(DEFAULT_SETTINGS),
      toast,
      notify,
      notificationsEnabled: !!tokens[currentUser],
      notificationsSupported,
      enableNotifications,
    }),
    [currentUser, moods, activities, messages, tokens, settings, toast, notify, notificationsSupported, enableNotifications, push],
  )

  return <CoupleContext.Provider value={value}>{children}</CoupleContext.Provider>
}

export function useCouple() {
  const ctx = useContext(CoupleContext)
  if (!ctx) throw new Error('useCouple must be used within CoupleProvider')
  return ctx
}

export function partnerKey(p: Partner | 'معاً') {
  return p === 'Moe' ? 'a' : p === 'Rio' ? 'b' : 'both'
}

export function energyLabel(energy: number) {
  if (energy < 30) return 'منخفضة'
  if (energy < 70) return 'متوسطة'
  return 'عالية'
}
