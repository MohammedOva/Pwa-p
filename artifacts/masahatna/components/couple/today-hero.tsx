'use client'

import { energyLabel, useCouple } from '@/lib/couple-store'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'صباح الخير'
  if (h < 18) return 'نهارك سعيد'
  return 'مساء الخير'
}

export function TodayHero() {
  const { currentUser, moods, activities, messages, memories } = useCouple()
  const a = moods['Moe']
  const b = moods['Rio']
  const harmony = a.mood && b.mood ? Math.max(0, 100 - Math.abs(a.energy - b.energy)) : null
  const overlap = harmony === null ? 0 : Math.round((harmony / 100) * 72)
  const done = activities.filter((x) => x.completed).length

  const today = new Intl.DateTimeFormat('ar', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())

  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="paper-grain relative overflow-hidden rounded-3xl border border-border bg-card p-6 md:p-10"
    >
      <div className="grid items-center gap-10 md:grid-cols-[1.15fr_1fr]">
        <div className="flex flex-col gap-6">
          <p
            suppressHydrationWarning
            className="w-fit rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground"
          >
            {today}
          </p>
          <h1
            suppressHydrationWarning
            id="hero-title"
            className="font-display text-4xl font-semibold leading-[1.15] text-balance md:text-6xl"
          >
            {greeting()} يا{' '}
            <span className={currentUser === 'Moe' ? 'text-partner-a' : 'text-partner-b'}>
              {currentUser}
            </span>
            <span className="block text-muted-foreground">ماذا نكتب اليوم؟</span>
          </h1>

          <dl className="grid grid-cols-3 gap-3">
            {[
              { label: 'مهام أُنجزت', value: `${done}/${activities.length}` },
              { label: 'رسائل', value: messages.length },
              { label: 'ذكريات', value: memories.length },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-border bg-background/70 p-3 md:p-4">
                <dt className="text-xs text-muted-foreground">{s.label}</dt>
                <dd className="font-display text-2xl font-semibold md:text-3xl">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <figure
          className="flex flex-col items-center gap-5"
          aria-label={harmony === null ? 'لم يسجل الطرفان مزاج اليوم' : `مؤشر الانسجام ${harmony}%`}
        >
          <div className="flex items-center justify-center" dir="ltr">
            <MoodOrb name="Rio" mood={b.mood} energy={b.energy} variant="b" />
            <div
              className="relative z-10 flex flex-col items-center justify-center transition-all duration-700 ease-out"
              style={{ marginInline: `-${overlap}px`, width: `${Math.max(56, overlap * 1.4)}px` }}
            >
              {harmony !== null && (
                <span className="rounded-full bg-foreground px-3 py-1 font-display text-lg font-semibold text-background shadow-lg">
                  {harmony}%
                </span>
              )}
            </div>
            <MoodOrb name="Moe" mood={a.mood} energy={a.energy} variant="a" />
          </div>
          <figcaption className="text-center text-sm text-muted-foreground text-pretty">
            {harmony === null
              ? 'سجّلا مزاجكما اليوم لتظهر مقارنة الطاقة.'
              : harmony >= 75
              ? 'طاقتكما متقاربة جداً اليوم — وقت مثالي لنشاط مشترك.'
              : harmony >= 45
                ? 'انسجام جيد، القليل من التفهّم يكفي.'
                : 'طاقتكما مختلفة اليوم، كونا لطيفين مع بعض.'}
          </figcaption>
        </figure>
      </div>
    </section>
  )
}

function MoodOrb({
  name,
  mood,
  energy,
  variant,
}: {
  name: string
  mood: string
  energy: number
  variant: 'a' | 'b'
}) {
  return (
    <div
      className={
        'flex size-32 shrink-0 flex-col sm:size-36 items-center justify-center gap-1 rounded-full border-2 md:size-44 ' +
        (variant === 'a'
          ? 'border-partner-a bg-partner-a/15 text-partner-a'
          : 'border-partner-b bg-partner-b/15 text-partner-b')
      }
      dir="rtl"
    >
      <span className="text-5xl md:text-6xl" role="img" aria-label={`مزاج ${name}`}>
        {mood || '—'}
      </span>
      <span className="text-sm font-semibold">{name}</span>
      <span className="text-xs opacity-80">
        {mood ? `طاقة ${energyLabel(energy)} · ${energy}%` : 'لم يسجل بعد'}
      </span>
    </div>
  )
}
