'use client'

import { useEffect, useState } from 'react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'pwa-install-dismissed'

export function PwaInstall() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIosHint, setShowIosHint] = useState(false)

  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }

    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true
    if (standalone || sessionStorage.getItem(DISMISS_KEY)) return

    const onPrompt = (event: Event) => {
      event.preventDefault()
      setDeferred(event as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)

    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent)
    if (isIos) setShowIosHint(true)

    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, '1')
    setDeferred(null)
    setShowIosHint(false)
  }

  const install = async () => {
    if (!deferred) return
    await deferred.prompt()
    await deferred.userChoice
    setDeferred(null)
  }

  if (!deferred && !showIosHint) return null

  return (
    <div
      role="dialog"
      aria-label="تثبيت التطبيق"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-lg"
    >
      <img src="/icons/icon-192.png" alt="" className="size-11 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold leading-tight">ثبّت مساحتنا على جهازك</p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {deferred ? (
            'افتحه كتطبيق من الشاشة الرئيسية، حتى بدون إنترنت.'
          ) : (
'اضغط «مشاركة» ثم «إضافة إلى الشاشة الرئيسية»'
          )}
        </p>
      </div>
      {deferred && (
        <button
          type="button"
          onClick={install}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          تثبيت
        </button>
      )}
      <button
        type="button"
        onClick={dismiss}
        className="shrink-0 rounded-full px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        لاحقاً
      </button>
    </div>
  )
}
