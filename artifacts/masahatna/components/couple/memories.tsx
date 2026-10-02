'use client'

import Image from 'next/image'
import { useCouple } from '@/lib/couple-store'
import { cn } from '@/lib/utils'
import { SectionHeading } from './section-heading'

const TILTS = ['-rotate-2', 'rotate-1', 'rotate-2', '-rotate-1']

export function Memories() {
  const { memories, notify } = useCouple()

  return (
    <section
      id="memories"
      aria-labelledby="memories-title"
      className="rounded-3xl border border-border bg-card p-6 md:p-8"
    >
      <SectionHeading
        id="memories-title"
        index="٠٤"
        title="ألبوم الذكريات"
        subtitle="لحظات نريد أن نتذكرها دائماً."
      />

      <ul className="grid grid-cols-2 gap-4 md:gap-6">
        {memories.length === 0 && (
          <li className="col-span-2 py-5 text-center text-sm text-muted-foreground">
            لا توجد ذكريات محفوظة بعد.
          </li>
        )}
        {memories.map((m, i) => (
          <li key={m.id}>
            <figure
              className={cn(
                'rounded-sm bg-background p-2 pb-3 shadow-[0_8px_24px_-12px_rgb(0_0_0/0.35)] transition-transform duration-300 hover:z-10 hover:rotate-0 hover:scale-[1.03]',
                TILTS[i % TILTS.length],
              )}
            >
              <div className="relative aspect-square overflow-hidden rounded-[2px] bg-muted">
                <Image
                  src={m.src || '/placeholder.svg'}
                  alt={m.caption}
                  fill
                  sizes="(min-width: 768px) 280px, 45vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-2 flex items-baseline justify-between gap-2 px-1">
                <span className="truncate font-display text-sm font-medium">{m.caption}</span>
                <span
                  className={cn(
                    'shrink-0 text-xs',
                    m.by === 'Moe' ? 'text-partner-a' : 'text-partner-b',
                  )}
                >
                  {m.date}
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
        <li className="col-span-2">
          <button
            type="button"
            onClick={() => notify('رفع الذكريات غير مفعّل بعد')}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border py-5 text-sm text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
          >
            أضف ذكرى جديدة
          </button>
        </li>
      </ul>
    </section>
  )
}
