'use client'

import { ChevronLeft, ChevronRight, type LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { initials } from '@/lib/data'

export function GlassButton({
  icon: Icon,
  label,
  onClick,
  primary,
  className,
}: {
  icon: LucideIcon
  label: string
  onClick?: () => void
  primary?: boolean
  className?: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        'press flex size-11 shrink-0 items-center justify-center rounded-full',
        primary ? 'bg-primary text-primary-foreground shadow-lg shadow-black/15' : 'glass text-foreground',
        className,
      )}
    >
      <Icon className="size-[19px]" strokeWidth={2} aria-hidden />
    </button>
  )
}

export function Screen({
  title,
  subtitle,
  back,
  onBack,
  actions,
  children,
  largeTitle = true,
  hero,
}: {
  title: string
  subtitle?: string
  back?: boolean
  onBack?: () => void
  actions?: React.ReactNode
  children: React.ReactNode
  largeTitle?: boolean
  hero?: React.ReactNode
}) {
  const [scrolled, setScrolled] = useState(false)
  return (
    <div className="absolute inset-0 flex flex-col bg-background">
      <header
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 z-20 pt-[var(--top)] transition-[background,box-shadow] duration-300',
          scrolled && 'bg-background/75 backdrop-blur-xl backdrop-saturate-150',
        )}
      >
        <div className="pointer-events-auto relative flex h-14 items-center gap-2 px-4">
          {back && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Назад"
              className="press glass flex size-11 items-center justify-center rounded-full"
            >
              <ChevronLeft className="size-6" strokeWidth={2.25} aria-hidden />
            </button>
          )}
          <div
            className={cn(
              'pointer-events-none absolute inset-x-20 text-center text-[17px] font-semibold transition-opacity duration-200',
              scrolled || !largeTitle ? 'opacity-100' : 'opacity-0',
            )}
          >
            <span className="block truncate">{title}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">{actions}</div>
        </div>
      </header>
      <div
        className="no-scrollbar flex-1 overflow-y-auto overscroll-contain"
        onScroll={(e) => setScrolled(e.currentTarget.scrollTop > (hero ? 220 : 36))}
      >
        {hero}
        <div className={cn(hero ? 'pt-4' : 'pt-[calc(var(--top)+56px)]', 'pb-[calc(var(--bottom)+110px)]')}>
          {largeTitle && !hero && (
            <div className="px-5 pb-3">
              {subtitle && <p className="text-[13px] font-medium text-muted-foreground">{subtitle}</p>}
              <h1 className="text-[34px] leading-[1.1] font-bold">{title}</h1>
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}

export function Group({
  header,
  footer,
  children,
  className,
  action,
}: {
  header?: string
  footer?: React.ReactNode
  children: React.ReactNode
  className?: string
  action?: React.ReactNode
}) {
  return (
    <section className={cn('px-4 pb-6', className)}>
      {(header || action) && (
        <div className="flex items-end justify-between px-4 pb-2">
          {header && <h2 className="label-section">{header}</h2>}
          {action}
        </div>
      )}
      <div className="overflow-hidden rounded-[22px] bg-card">{children}</div>
      {footer && <p className="px-4 pt-2 text-[13px] leading-snug text-muted-foreground">{footer}</p>}
    </section>
  )
}

export function IconTile({ icon: Icon, tone = 'neutral' }: { icon: LucideIcon; tone?: Tone }) {
  return (
    <span
      className={cn(
        'flex size-[30px] shrink-0 items-center justify-center rounded-[9px]',
        tone === 'neutral' && 'bg-secondary text-foreground',
        tone === 'dark' && 'bg-primary text-primary-foreground',
        tone === 'danger' && 'bg-destructive/12 text-destructive',
        tone === 'warning' && 'bg-warning/20 text-warning-ink',
        tone === 'success' && 'bg-success/15 text-success-ink',
      )}
    >
      <Icon className="size-4" strokeWidth={2} aria-hidden />
    </span>
  )
}

export type Tone = 'neutral' | 'dark' | 'danger' | 'warning' | 'success'

export function Row({
  icon,
  tone,
  leading,
  title,
  subtitle,
  value,
  trailing,
  onClick,
  chevron = !!onClick,
  destructive,
  className,
}: {
  icon?: LucideIcon
  tone?: Tone
  leading?: React.ReactNode
  title: React.ReactNode
  subtitle?: React.ReactNode
  value?: React.ReactNode
  trailing?: React.ReactNode
  onClick?: () => void
  chevron?: boolean
  destructive?: boolean
  className?: string
}) {
  const content = (
    <>
      {leading ?? (icon && <IconTile icon={icon} tone={tone} />)}
      <div className="flex min-w-0 flex-1 items-center gap-3 self-stretch border-b border-separator py-3 pr-4 group-last/row:border-b-0">
        <div className="min-w-0 flex-1">
          <div className={cn('truncate text-[16px] leading-snug', destructive && 'text-destructive')}>{title}</div>
          {subtitle && <div className="mt-0.5 text-[13px] leading-snug text-muted-foreground">{subtitle}</div>}
        </div>
        {value && <span className="shrink-0 text-[15px] text-muted-foreground tabular-nums">{value}</span>}
        {trailing}
        {chevron && <ChevronRight className="size-4 shrink-0 text-muted-foreground/60" strokeWidth={2.5} aria-hidden />}
      </div>
    </>
  )
  const cls = cn('group/row flex min-h-[52px] w-full items-center gap-3 pl-4 text-left', className)
  if (onClick)
    return (
      <button type="button" onClick={onClick} className={cn(cls, 'transition-colors active:bg-accent')}>
        {content}
      </button>
    )
  return <div className={cls}>{content}</div>
}

type BadgeKind = 'success' | 'warning' | 'danger' | 'neutral' | 'dark' | 'outline'
export function Badge({ kind = 'neutral', children, className }: { kind?: BadgeKind; children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-[22px] shrink-0 items-center gap-1 rounded-full px-2 text-[12px] font-medium whitespace-nowrap',
        kind === 'success' && 'bg-success/14 text-success-ink',
        kind === 'warning' && 'bg-warning/20 text-warning-ink',
        kind === 'danger' && 'bg-destructive/10 text-destructive',
        kind === 'neutral' && 'bg-secondary text-secondary-foreground',
        kind === 'dark' && 'bg-primary text-primary-foreground',
        kind === 'outline' && 'border border-border text-foreground',
        className,
      )}
    >
      {children}
    </span>
  )
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  icon?: LucideIcon
}) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        'press inline-flex items-center justify-center gap-1.5 rounded-full font-semibold whitespace-nowrap disabled:pointer-events-none disabled:opacity-40',
        size === 'sm' && 'h-9 px-3.5 text-[14px]',
        size === 'md' && 'h-11 px-5 text-[15px]',
        size === 'lg' && 'h-[52px] px-6 text-[17px]',
        variant === 'primary' && 'bg-primary text-primary-foreground',
        variant === 'secondary' && 'bg-secondary text-secondary-foreground',
        variant === 'outline' && 'border border-border bg-card text-foreground',
        variant === 'ghost' && 'text-foreground active:bg-accent',
        variant === 'destructive' && 'bg-destructive text-white',
        className,
      )}
    >
      {Icon && <Icon className={size === 'sm' ? 'size-4' : 'size-[18px]'} strokeWidth={2} aria-hidden />}
      {children}
    </button>
  )
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
  className?: string
}) {
  return (
    <div role="radiogroup" className={cn('flex rounded-full bg-secondary p-[3px]', className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'h-9 flex-1 rounded-full px-3 text-[14px] font-medium transition-all duration-200',
            value === o.value ? 'bg-card text-foreground shadow-[0_1px_3px_rgb(0_0_0/0.12)]' : 'text-muted-foreground',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Chip({
  active,
  children,
  onClick,
  count,
}: {
  active?: boolean
  children: React.ReactNode
  onClick?: () => void
  count?: number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'press inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[14px] font-medium whitespace-nowrap transition-colors',
        active ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground',
      )}
    >
      {children}
      {count !== undefined && count > 0 && (
        <span className={cn('tabular-nums', active ? 'text-primary-foreground/70' : 'text-muted-foreground')}>{count}</span>
      )}
    </button>
  )
}

export function ChipScroller({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('no-scrollbar flex gap-2 overflow-x-auto px-4 pb-4', className)}>{children}</div>
}

export function Avatar({ name, size = 40, className }: { name: string; size?: number; className?: string }) {
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-neutral-300 to-neutral-400 font-semibold text-white dark:from-neutral-500 dark:to-neutral-600',
        className,
      )}
    >
      {initials(name)}
    </span>
  )
}

export function SearchField({
  value,
  onChange,
  placeholder = 'Поиск',
  autoFocus,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  autoFocus?: boolean
}) {
  return (
    <label className="flex h-11 items-center gap-2 rounded-full bg-card px-4">
      <svg aria-hidden viewBox="0 0 24 24" className="size-[18px] text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2.25">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" strokeLinecap="round" />
      </svg>
      <span className="sr-only">{placeholder}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        type="search"
        className="h-full min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-muted-foreground"
      />
    </label>
  )
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="px-4 text-[13px] font-medium text-muted-foreground">{label}</span>
      {children}
      {hint && <span className="px-4 text-[12px] text-muted-foreground">{hint}</span>}
    </div>
  )
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        'h-[52px] w-full rounded-[16px] bg-card px-4 text-[17px] outline-none ring-foreground/15 placeholder:text-muted-foreground focus:ring-2',
        props.className,
      )}
    />
  )
}

export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('h-1.5 overflow-hidden rounded-full bg-secondary', className)}
    >
      <div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${value}%` }} />
    </div>
  )
}

export function Empty({ icon: Icon, title, text, action }: { icon: LucideIcon; title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center px-10 py-14 text-center">
      <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-card">
        <Icon className="size-6 text-muted-foreground" aria-hidden />
      </span>
      <p className="text-[17px] font-semibold">{title}</p>
      <p className="mt-1 text-[14px] leading-snug text-muted-foreground">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
