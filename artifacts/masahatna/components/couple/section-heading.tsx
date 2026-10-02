import type { ReactNode } from 'react'

export function SectionHeading({
  id,
  index,
  title,
  subtitle,
  action,
}: {
  id: string
  index: string
  title: string
  subtitle: string
  action?: ReactNode
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div className="flex items-start gap-3">
        <span className="mt-1 font-display text-sm text-muted-foreground">{index}</span>
        <div>
          <h2 id={id} className="font-display text-2xl font-semibold leading-tight md:text-3xl">
            {title}
          </h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {action}
    </div>
  )
}
