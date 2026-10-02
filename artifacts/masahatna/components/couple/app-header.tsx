'use client'

import { PARTNERS, useCouple } from '@/lib/couple-store'
import { cn } from '@/lib/utils'

export function AppHeader({ onOpenSettings }: { onOpenSettings: () => void }) {
  const { currentUser, setCurrentUser } = useCouple()

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 md:px-6">
        <a href="#top" className="flex items-center gap-3" aria-label="مساحتنا — الصفحة الرئيسية">
          <span aria-hidden="true" className="relative flex h-9 w-12 items-center">
            <span className="absolute right-0 size-8 rounded-full bg-partner-a/85" />
            <span className="absolute left-0 size-8 rounded-full bg-partner-b/85 mix-blend-multiply" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-display text-xl font-semibold tracking-tight">مساحتنا</span>
            <span className="hidden text-xs text-muted-foreground sm:block">دفتر يوميات لاثنين</span>
          </span>
        </a>

        <div className="flex items-center gap-2">
          <div
            role="radiogroup"
            aria-label="من يكتب الآن؟"
            className="flex items-center gap-1 rounded-full border border-border bg-card p-1"
          >
            {PARTNERS.map((p) => {
              const active = p === currentUser
              const isA = p === 'Moe'
              return (
                <button
                  key={p}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setCurrentUser(p)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm font-medium transition-all md:gap-2 md:px-4',
                    active
                      ? isA
                        ? 'bg-partner-a text-primary-foreground shadow-sm'
                        : 'bg-partner-b text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'size-2 rounded-full',
                      active ? 'bg-primary-foreground' : isA ? 'bg-partner-a' : 'bg-partner-b',
                    )}
                  />
                  {p}
                </button>
              )
            })}
          </div>

          <button
            type="button"
            onClick={onOpenSettings}
            className="rounded-full border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            تخصيص
          </button>
        </div>
      </div>
    </header>
  )
}
