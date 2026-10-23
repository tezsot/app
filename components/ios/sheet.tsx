'use client'

import { Check, X } from 'lucide-react'
import { useEffect, useId } from 'react'
import { cn } from '@/lib/utils'

export function SheetFrame({
  title,
  onClose,
  onConfirm,
  confirmDisabled,
  confirmLabel = 'Готово',
  detent = 'large',
  children,
  depth = 0,
}: {
  title?: string
  onClose: () => void
  onConfirm?: () => void
  confirmDisabled?: boolean
  confirmLabel?: string
  detent?: 'large' | 'medium' | 'auto'
  children: React.ReactNode
  depth?: number
}) {
  const titleId = useId()
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end" style={{ zIndex: 50 + depth }}>
      <button
        type="button"
        aria-label="Закрыть"
        onClick={onClose}
        className="anim-fade absolute inset-0 bg-black/30 dark:bg-black/55"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={cn(
          'anim-sheet relative flex flex-col overflow-hidden rounded-t-[34px] bg-background shadow-[0_-8px_32px_rgb(0_0_0/0.12)]',
          detent === 'large' && 'h-[calc(100%-var(--top)-10px)]',
          detent === 'medium' && 'max-h-[62%]',
          detent === 'auto' && 'max-h-[calc(100%-var(--top)-10px)]',
        )}
      >
        <div className="mx-auto mt-2 h-[5px] w-9 rounded-full bg-foreground/20" aria-hidden />
        <div className="flex items-center gap-2 px-4 pt-2 pb-2">
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="press glass flex size-11 items-center justify-center rounded-full"
          >
            <X className="size-5" strokeWidth={2.25} aria-hidden />
          </button>
          <h2 id={titleId} className="flex-1 truncate text-center text-[17px] font-semibold">
            {title}
          </h2>
          {onConfirm ? (
            <button
              type="button"
              onClick={onConfirm}
              disabled={confirmDisabled}
              aria-label={confirmLabel}
              className="press flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-30"
            >
              <Check className="size-5" strokeWidth={2.5} aria-hidden />
            </button>
          ) : (
            <span className="size-11" aria-hidden />
          )}
        </div>
        <div className="no-scrollbar flex-1 overflow-y-auto overscroll-contain pb-[calc(var(--bottom)+16px)]">
          {children}
        </div>
      </div>
    </div>
  )
}
