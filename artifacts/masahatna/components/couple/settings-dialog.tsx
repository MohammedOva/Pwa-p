'use client'

import { useEffect, useRef } from 'react'
import { type ThemeName, useCouple } from '@/lib/couple-store'
import { cn } from '@/lib/utils'

const THEMES: { id: ThemeName; label: string; swatch: [string, string, string] }[] = [
  { id: 'paper', label: 'ورق', swatch: ['#f3ece1', '#35577d', '#c2553f'] },
  { id: 'night', label: 'ليل', swatch: ['#131519', '#8fb4e6', '#f19c86'] },
  { id: 'sea', label: 'بحر', swatch: ['#e5edee', '#1d6a86', '#d86a4f'] },
  { id: 'dusk', label: 'غروب', swatch: ['#25171f', '#f2b36a', '#f27d86'] },
]

export function SettingsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const { settings, updateSettings, resetSettings, notificationsEnabled, notificationsSupported, enableNotifications, currentUser } =
    useCouple()
  const activeTheme = THEMES.find((t) => t.id === settings.theme) ?? THEMES[0]

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose()
      }}
      aria-labelledby="settings-title"
      className="settings-dialog m-auto w-[min(92vw,440px)] rounded-3xl border border-border bg-card p-0 text-card-foreground shadow-2xl"
    >
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 id="settings-title" className="font-display text-2xl font-semibold">
            تخصيص الدفتر
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-muted px-3.5 py-1.5 text-sm font-medium transition-colors hover:bg-border"
          >
            إغلاق
          </button>
        </div>

        <fieldset className="mb-6">
          <legend className="mb-3 text-sm font-semibold">المظهر</legend>
          <div className="grid grid-cols-4 gap-2">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                aria-pressed={settings.theme === t.id}
                onClick={() => updateSettings({ theme: t.id })}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-2xl border-2 p-2 text-xs transition-colors',
                  settings.theme === t.id ? 'border-foreground' : 'border-border hover:border-muted-foreground',
                )}
              >
                <span
                  aria-hidden="true"
                  className="flex h-10 w-full items-center justify-center gap-1 rounded-xl"
                  style={{ background: t.swatch[0] }}
                >
                  <span className="size-3 rounded-full" style={{ background: t.swatch[1] }} />
                  <span className="size-3 rounded-full" style={{ background: t.swatch[2] }} />
                </span>
                {t.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="mb-6 grid grid-cols-2 gap-3">
          <legend className="mb-3 text-sm font-semibold">لون كل شريك</legend>
          <ColorField
            id="color-a"
            label="Moe"
            fallback={activeTheme.swatch[1]}
            value={settings.partnerA}
            onChange={(v) => updateSettings({ partnerA: v })}
          />
          <ColorField
            id="color-b"
            label="Rio"
            fallback={activeTheme.swatch[2]}
            value={settings.partnerB}
            onChange={(v) => updateSettings({ partnerB: v })}
          />
        </fieldset>

        <div className="mb-5">
          <div className="mb-2 flex justify-between text-sm">
            <label htmlFor="font-size" className="font-semibold">
              حجم الخط
            </label>
            <span className="tabular-nums text-muted-foreground">{settings.fontSize}px</span>
          </div>
          <input
            id="font-size"
            type="range"
            min={14}
            max={19}
            step={0.5}
            value={settings.fontSize}
            onChange={(e) => updateSettings({ fontSize: Number(e.target.value) })}
            className="w-full accent-foreground"
          />
        </div>

        <div className="mb-6">
          <div className="mb-2 flex justify-between text-sm">
            <label htmlFor="brightness" className="font-semibold">
              الإضاءة
            </label>
            <span className="tabular-nums text-muted-foreground">{settings.brightness}%</span>
          </div>
          <input
            id="brightness"
            type="range"
            min={60}
            max={120}
            step={5}
            value={settings.brightness}
            onChange={(e) => updateSettings({ brightness: Number(e.target.value) })}
            className="w-full accent-foreground"
          />
        </div>

        <fieldset className="mb-6">
          <legend className="mb-3 text-sm font-semibold">الإشعارات</legend>
          <button
            type="button"
            onClick={enableNotifications}
            disabled={notificationsEnabled || !notificationsSupported}
            className={cn(
              'w-full rounded-2xl border p-3 text-sm font-medium transition-colors',
              notificationsEnabled
                ? 'border-border bg-muted text-muted-foreground'
                : 'border-foreground hover:bg-muted',
            )}
          >
            {notificationsEnabled
              ? `✓ الإشعارات مفعّلة على هذا الجهاز (${currentUser})`
              : notificationsSupported
                ? 'تفعيل إشعارات هذا الجهاز'
                : 'الإشعارات غير مدعومة على هذا المتصفح'}
          </button>
          <p className="mt-2 text-xs text-muted-foreground">
            فعّلها من جوال كل شريك على حدة عشان توصل له إشعارات أفعال الثاني.
          </p>
        </fieldset>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full bg-foreground py-3 text-sm font-semibold text-background"
          >
            تم
          </button>
          <button
            type="button"
            onClick={resetSettings}
            className="rounded-full border border-border px-5 py-3 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            استعادة الافتراضي
          </button>
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">التفضيلات على هذا الجهاز، والمحتوى المشترك يتزامن بين الجهازين.</p>
      </div>
    </dialog>
  )
}

function ColorField({
  id,
  label,
  fallback,
  value,
  onChange,
}: {
  id: string
  label: string
  fallback: string
  value: string | null
  onChange: (v: string) => void
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border bg-background p-2 pe-3"
    >
      <input
        id={id}
        type="color"
        value={value ?? fallback}
        onChange={(e) => onChange(e.target.value)}
        className="size-9 cursor-pointer rounded-xl border-0 bg-transparent p-0"
      />
      <span className="text-sm font-medium">{label}</span>
    </label>
  )
}
