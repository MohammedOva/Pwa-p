import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getMessaging, isSupported, type Messaging } from 'firebase/messaging'

// Config from the Firebase console (Project settings → General → Your apps → Web app).
// These are safe to ship in client code — Firestore/Storage access is controlled by
// the security rules (firestore.rules), not by hiding this object.
const firebaseConfig = {
  apiKey: 'AIzaSyCVI7TqzqZTJyVdieQK9d8r5Kmxvzz73Rs',
  authDomain: 'masahatna.firebaseapp.com',
  projectId: 'masahatna',
  storageBucket: 'masahatna.firebasestorage.app',
  messagingSenderId: '842825621418',
  appId: '1:842825621418:web:bc1e30ae89cbcbf5d355d3',
  measurementId: 'G-P8MBH92F54',
}

// VAPID key from Project settings → Cloud Messaging → Web configuration → Web Push certificates.
export const VAPID_KEY =
  'BIpF23ApdeBLdPTdKm9gC4R1OU4mB0kZp1RGyaEsnGpbrwSAy1CWpYTPbyGvxUr0TdAqJ54FmRlaLYOT2oNbvJo'

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig)
export const db = getFirestore(firebaseApp)

// The two of you share a single document — there's no login system, so this is
// simply a fixed id. If you ever want more than one couple using the app, this
// would need to become per-couple (e.g. a code they both enter).
export const COUPLE_DOC_PATH = ['couples', 'main'] as const

let messagingInstance: Messaging | null | undefined

/** Lazily creates the Messaging instance, only in browsers that support it (no SSR, no unsupported browsers). */
export async function getMessagingIfSupported(): Promise<Messaging | null> {
  if (typeof window === 'undefined') return null
  if (messagingInstance !== undefined) return messagingInstance
  const supported = await isSupported().catch(() => false)
  messagingInstance = supported ? getMessaging(firebaseApp) : null
  return messagingInstance
}
