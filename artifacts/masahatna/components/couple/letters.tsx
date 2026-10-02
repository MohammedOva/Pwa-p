'use client'

import { useState } from 'react'
import { useCouple } from '@/lib/couple-store'
import { cn } from '@/lib/utils'
import { SectionHeading } from './section-heading'

const PROMPTS = ['أنا ممتن لـ...', 'تذكّرت اليوم...', 'أتمنى أن نفعل...']

export function Letters() {
  const { currentUser, messages, sendMessage, heartMessage } = useCouple()
  const [text, setText] = useState('')

  function send() {
    const t = text.trim()
    if (!t) return
    sendMessage(t)
    setText('')
  }

  return (
    <section
      id="letters"
      aria-labelledby="letters-title"
      className="flex flex-col rounded-3xl border border-border bg-card p-6 md:p-8"
    >
      <SectionHeading
        id="letters-title"
        index="٠٣"
        title="رسائل صغيرة"
        subtitle="امتنان، فكرة، أو كلمة حلوة."
      />

      <ol className="mb-5 flex max-h-96 flex-col gap-3 overflow-y-auto pe-1">
        {messages.map((m) => {
          const mine = m.from === currentUser
          const isA = m.from === 'Moe'
          return (
            <li key={m.id} className={cn('flex', mine ? 'justify-start' : 'justify-end')}>
              <article
                className={cn(
                  'max-w-[85%] rounded-2xl border-2 px-4 py-3',
                  isA ? 'border-partner-a/40 bg-partner-a/10' : 'border-partner-b/40 bg-partner-b/10',
                  mine ? 'rounded-ss-sm' : 'rounded-se-sm',
                )}
              >
                <header className="mb-1 flex items-center gap-2 text-xs">
                  <span className={cn('font-semibold', isA ? 'text-partner-a' : 'text-partner-b')}>
                    {m.from}
                  </span>
                  <time className="text-muted-foreground">{m.time}</time>
                </header>
                <p className="text-sm leading-relaxed text-pretty">{m.text}</p>
                <button
                  type="button"
                  onClick={() => heartMessage(m.id)}
                  className={cn(
                    'mt-2 flex items-center gap-1 text-xs transition-colors hover:text-partner-b',
                    m.hearts > 0 ? 'font-medium text-partner-b' : 'text-muted-foreground',
                  )}
                >
                  أعجبني
                  {m.hearts > 0 && <span className="tabular-nums">· {m.hearts}</span>}
                </button>
              </article>
            </li>
          )
        })}
      </ol>

      <div className="mt-auto">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {PROMPTS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setText(p.replace('...', ' '))}
              className="rounded-full border border-dashed border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
            >
              {p}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            send()
          }}
          className="flex items-end gap-2 rounded-2xl border border-border bg-background p-2 focus-within:border-foreground"
        >
          <label htmlFor="letter" className="sr-only">
            اكتب رسالة
          </label>
          <textarea
            id="letter"
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                if (e.nativeEvent.isComposing || e.keyCode === 229) return
                e.preventDefault()
                send()
              }
            }}
            placeholder={`اكتب لشريكك يا ${currentUser}...`}
            className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className={cn(
              'h-10 shrink-0 rounded-xl px-4 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-40',
              currentUser === 'Moe' ? 'bg-partner-a' : 'bg-partner-b',
            )}
          >
            أرسل
          </button>
        </form>
      </div>
    </section>
  )
}
