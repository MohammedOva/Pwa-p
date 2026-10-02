'use client'

import { useState } from 'react'
import { energyLabel, useCouple } from '@/lib/couple-store'
import { cn } from '@/lib/utils'
import { SectionHeading } from './section-heading'

const MOODS = [
  { emoji: '😊', label: 'سعيد' },
  { emoji: '😄', label: 'مبتهج' },
  { emoji: '😍', label: 'عاشق' },
  { emoji: '🤗', label: 'ممتن' },
  { emoji: '😔', label: 'حزين' },
  { emoji: '😴', label: 'متعب' },
  { emoji: '😤', label: 'متضايق' },
  { emoji: '🤔', label: 'مفكّر' },
]

export function MoodJournal() {
  const { currentUser, moods, saveMood, notify } = useCouple()
  const isA = currentUser === 'Moe'
  const current = moods[currentUser]
  const [mood, setMood] = useState(current.mood)
  const [energy, setEnergy] = useState(current.energy)
  const [note, setNote] = useState(current.note)
  const [lastUser, setLastUser] = useState(currentUser)

  if (lastUser !== currentUser) {
    setLastUser(currentUser)
    setMood(current.mood)
    setEnergy(current.energy)
    setNote(current.note)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    saveMood({ mood, energy, note })
    notify(`تم حفظ مزاج ${currentUser}`)
  }

  return (
    <section
      id="mood"
      aria-labelledby="mood-title"
      className="rounded-3xl border border-border bg-card p-6 md:p-8"
    >
      <SectionHeading
        id="mood-title"
        index="٠١"
        title={`كيف حالك يا ${currentUser}؟`}
        subtitle="سجّل مزاجك وطاقتك ليعرف شريكك كيف يقترب منك اليوم."
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-7">
        <fieldset>
          <legend className="mb-3 text-sm font-semibold">المزاج</legend>
          <div className="grid grid-cols-4 gap-2 md:gap-3">
            {MOODS.map((m) => {
              const selected = m.emoji === mood
              return (
                <button
                  key={m.emoji}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setMood(m.emoji)}
                  className={cn(
                    'group flex flex-col items-center gap-1 rounded-2xl border-2 bg-background py-3 transition-all hover:-translate-y-0.5',
                    selected
                      ? isA
                        ? 'border-partner-a bg-partner-a/10'
                        : 'border-partner-b bg-partner-b/10'
                      : 'border-transparent',
                  )}
                >
                  <span
                    className="text-3xl transition-transform group-hover:scale-110 md:text-4xl"
                    aria-hidden="true"
                  >
                    {m.emoji}
                  </span>
                  <span className="text-xs text-muted-foreground">{m.label}</span>
                </button>
              )
            })}
          </div>
        </fieldset>

        <div>
          <div className="mb-3 flex items-baseline justify-between">
            <label htmlFor="energy" className="text-sm font-semibold">
              مستوى الطاقة
            </label>
            <output htmlFor="energy" className="font-display text-3xl font-semibold tabular-nums">
              {energy}
              <span className="text-base text-muted-foreground">%</span>
              <span className="ms-2 text-sm font-normal text-muted-foreground">
                {energyLabel(energy)}
              </span>
            </output>
          </div>
          <input
            id="energy"
            type="range"
            min={0}
            max={100}
            value={energy}
            onChange={(e) => setEnergy(Number(e.target.value))}
            className="energy-range"
          />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>مستنزف</span>
            <span>متّقد</span>
          </div>
        </div>

        <div>
          <label htmlFor="mood-note" className="mb-2 block text-sm font-semibold">
            سطر في الدفتر <span className="font-normal text-muted-foreground">(اختياري)</span>
          </label>
          <textarea
            id="mood-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="ما الذي يدور في بالك الآن..."
            className="w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm leading-relaxed placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={!mood}
          className={cn(
            'flex items-center justify-center gap-2 rounded-full py-3.5 font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50',
            isA ? 'bg-partner-a' : 'bg-partner-b',
          )}
        >
          سجّل مزاجي
        </button>
      </form>
    </section>
  )
}
