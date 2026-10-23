'use client'

import { CircleCheck } from 'lucide-react'
import { useStore } from '@/lib/store'

export function ToastHost() {
  const { toast, dismissToast } = useStore()
  if (!toast) return null
  return (
    <div
      key={toast.id}
      role="status"
      aria-live="polite"
      className="anim-rise absolute inset-x-4 bottom-[calc(var(--bottom)+76px)] z-[80] flex justify-center"
    >
      <div className="glass flex min-h-12 items-center gap-2.5 rounded-full py-1.5 pr-1.5 pl-4">
        <CircleCheck className="anim-pop size-[18px] text-success" strokeWidth={2.25} aria-hidden />
        <span className="text-[15px] font-medium">{toast.message}</span>
        {toast.undo ? (
          <button
            type="button"
            onClick={() => {
              toast.undo?.()
              dismissToast()
            }}
            className="press h-9 rounded-full bg-foreground/[0.08] px-3.5 text-[14px] font-semibold"
          >
            Отменить
          </button>
        ) : (
          <span className="w-2.5" />
        )}
      </div>
    </div>
  )
}
