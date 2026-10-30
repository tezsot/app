'use client'

import { useState } from 'react'
import { Building2, Check, ChevronRight } from 'lucide-react'
import { type Property, money, propertyTitle } from '@/lib/data'
import { cn } from '@/lib/utils'

export function DealPropertyOption({ property, selected = false, summary = false, onClick }: { property: Property; selected?: boolean; summary?: boolean; onClick: () => void }) {
  const [failed, setFailed] = useState(false)
  const image = property.image || property.images?.[0]
  return <button type="button" onClick={onClick} aria-pressed={summary ? undefined : selected} className={cn('flex w-full items-center gap-3 rounded-[22px] border bg-card p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary', selected && !summary ? 'border-primary bg-primary/5' : 'border-border')}>
    <span className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-secondary">
      {image && !failed ? <img src={image} alt="" loading="lazy" onError={() => setFailed(true)} className="size-full object-cover" /> : <Building2 className="size-7 text-muted-foreground" aria-hidden />}
    </span>
    <span className="flex min-w-0 flex-1 flex-col gap-1">
      <span className="text-xs text-muted-foreground">{property.op === 'rent' ? 'Аренда' : 'Продажа'} · {property.district}</span>
      <span className="text-[15px] font-semibold leading-snug">{propertyTitle(property)}</span>
      <span className="truncate text-xs text-muted-foreground">{property.address}</span>
      <span className="text-sm font-semibold tabular-nums">{money(property.price)}{property.op === 'rent' ? ' / мес.' : ''}</span>
    </span>
    {summary ? <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden /> : <span className={cn('flex size-6 shrink-0 items-center justify-center rounded-full border', selected ? 'border-primary bg-primary text-primary-foreground' : 'border-border')}>{selected && <Check className="size-4" aria-hidden />}</span>}
  </button>
}
