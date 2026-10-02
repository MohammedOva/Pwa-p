'use client'

import { useState } from 'react'
import { type Activity, useCouple } from '@/lib/couple-store'
import { cn } from '@/lib/utils'
import { SectionHeading } from './section-heading'

const CATEGORIES = ['المنزل', 'الطبخ', 'التسوق', 'الرياضة', 'ترفيه']
const ASSIGNEES: Activity['assignee'][] = ['معاً', 'Moe', 'Rio']
const FILTERS = ['الكل', ...ASSIGNEES] as const

function assigneeStyles(a: Activity['assignee']) {
  if (a === 'Moe') return { dot: 'bg-partner-a', ring: 'border-partner-a', text: 'text-partner-a' }
  if (a === 'Rio') return { dot: 'bg-partner-b', ring: 'border-partner-b', text: 'text-partner-b' }
  return { dot: 'bg-highlight', ring: 'border-highlight', text: 'text-foreground' }
}

export function SharedTasks() {
  const { activities, addActivity, toggleActivity, deleteActivity } = useCouple()
  const [title, setTitle] = useState('')
  const [assignee, setAssignee] = useState<Activity['assignee']>('معاً')
  const [category, setCategory] = useState('')
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('الكل')

  const done = activities.filter((a) => a.completed).length
  const progress = activities.length ? Math.round((done / activities.length) * 100) : 0
  const visible = filter === 'الكل' ? activities : activities.filter((a) => a.assignee === filter)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const t = title.trim()
    if (!t) return
    addActivity({ title: t, assignee, category })
    setTitle('')
    setCategory('')
  }

  return (
    <section
      id="tasks"
      aria-labelledby="tasks-title"
      className="flex flex-col rounded-3xl border border-border bg-card p-6 md:p-8"
    >
      <SectionHeading
        id="tasks-title"
        index="٠٢"
        title="قائمتنا"
        subtitle="مهام وأنشطة نتقاسمها."
        action={
          <span className="font-display text-3xl font-semibold tabular-nums">
            {progress}
            <span className="text-base text-muted-foreground">%</span>
          </span>
        }
      />

      <div
        className="mb-6 h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="نسبة الإنجاز"
      >
        <div
          className="h-full rounded-full bg-foreground transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <form onSubmit={handleSubmit} className="mb-6 rounded-2xl bg-background p-3">
        <div className="flex items-center gap-2">
          <label htmlFor="task-title" className="sr-only">
            عنوان النشاط
          </label>
          <input
            id="task-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="أضف نشاطاً جديداً..."
            className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            type="submit"
            className="shrink-0 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-40"
            disabled={!title.trim()}
          >
            أضف
          </button>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-border pt-3">
          {ASSIGNEES.map((a) => (
            <button
              key={a}
              type="button"
              aria-pressed={assignee === a}
              onClick={() => setAssignee(a)}
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors',
                assignee === a
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border text-muted-foreground hover:text-foreground',
              )}
            >
              <span className={cn('size-1.5 rounded-full', assigneeStyles(a).dot)} aria-hidden="true" />
              {a}
            </button>
          ))}
          <span className="mx-1 h-4 w-px bg-border" aria-hidden="true" />
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={category === c}
              onClick={() => setCategory(category === c ? '' : c)}
              className={cn(
                'rounded-full px-2.5 py-1 text-xs transition-colors',
                category === c ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              #{c}
            </button>
          ))}
        </div>
      </form>

      <div role="tablist" aria-label="تصفية المهام" className="mb-3 flex gap-4 border-b border-border">
        {FILTERS.map((f) => (
          <button
            key={f}
            role="tab"
            type="button"
            aria-selected={filter === f}
            onClick={() => setFilter(f)}
            className={cn(
              '-mb-px border-b-2 pb-2 text-sm transition-colors',
              filter === f
                ? 'border-foreground font-semibold text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <ul className="flex flex-col">
        {visible.length === 0 && (
          <li className="py-8 text-center text-sm text-muted-foreground">لا شيء هنا بعد.</li>
        )}
        {visible.map((a) => {
          const s = assigneeStyles(a.assignee)
          return (
            <li
              key={a.id}
              className="group flex items-center gap-3 border-b border-dashed border-border py-3 last:border-b-0"
            >
              <button
                type="button"
                role="checkbox"
                aria-checked={a.completed}
                aria-label={`إنجاز: ${a.title}`}
                onClick={() => toggleActivity(a.id)}
                className={cn(
                  'grid size-6 shrink-0 place-items-center rounded-full border-2 transition-colors',
                  s.ring,
                  a.completed && s.dot,
                )}
              >
                {a.completed && <span className="size-2 rounded-full bg-primary-foreground" aria-hidden="true" />}
              </button>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    'truncate text-sm font-medium transition-all',
                    a.completed && 'text-muted-foreground line-through',
                  )}
                >
                  {a.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className={s.text}>{a.assignee}</span>
                  {a.category && ` · #${a.category}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => deleteActivity(a.id)}
                aria-label={`حذف ${a.title}`}
                className="rounded-full px-2.5 py-1 text-xs text-muted-foreground opacity-60 transition hover:bg-muted hover:text-destructive group-hover:opacity-100"
              >
                حذف
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
