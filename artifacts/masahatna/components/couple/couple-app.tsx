'use client'

import { useState } from 'react'
import { CoupleProvider, useCouple } from '@/lib/couple-store'
import { AppHeader } from './app-header'
import { TodayHero } from './today-hero'
import { MoodJournal } from './mood-journal'
import { SharedTasks } from './shared-tasks'
import { Letters } from './letters'
import { Memories } from './memories'
import { SettingsDialog } from './settings-dialog'

export function CoupleApp() {
  return (
    <CoupleProvider>
      <Shell />
    </CoupleProvider>
  )
}

function Shell() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { toast } = useCouple()

  return (
    <>
      <AppHeader onOpenSettings={() => setSettingsOpen(true)} />

      <main className="mx-auto flex max-w-6xl flex-col gap-5 px-4 pb-16 pt-5 md:gap-6 md:px-6 md:pt-8">
        <TodayHero />
        <div className="grid grid-cols-1 gap-5 md:gap-6 lg:grid-cols-[1.1fr_1fr]">
          <MoodJournal />
          <SharedTasks />
        </div>
        <div className="grid grid-cols-1 gap-5 md:gap-6 lg:grid-cols-[1fr_1.1fr]">
          <Letters />
          <Memories />
        </div>
        <footer className="pt-4 text-center text-xs text-muted-foreground">
          مساحتنا — كُتب بحبّ، لاثنين فقط.
        </footer>
      </main>

      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-8 z-50 flex justify-center"
      >
        {toast && (
          <span className="animate-in fade-in slide-in-from-bottom-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background shadow-lg">
            {toast}
          </span>
        )}
      </div>

      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  )
}
