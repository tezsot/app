'use client'

import { useRef, useState } from 'react'
import { Building2, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { type Property, propertyTitle } from '@/lib/data'

export function PropertyGallery({ property }: { property: Property }) {
  const photos = [...new Set([property.image, ...(property.images ?? [])].filter((src): src is string => !!src))]
  const [index, setIndex] = useState(0)
  const dialog = useRef<HTMLDialogElement>(null)
  const current = Math.min(index, Math.max(0, photos.length - 1))
  const move = (step: number) => setIndex((value) => (value + step + photos.length) % photos.length)
  if (!photos.length) return <div className="flex h-80 flex-col items-center justify-center gap-3 bg-secondary text-muted-foreground"><Building2 aria-hidden /><span>Фотографии пока не добавлены</span></div>
  return <>
    <div className="relative h-80 bg-secondary">
      <button type="button" className="size-full" aria-label={`Открыть фотографии: ${propertyTitle(property)}`} onClick={() => dialog.current?.showModal()}>
        <img src={photos[current]} alt={`${propertyTitle(property)} · фото ${current + 1}`} className="size-full object-cover" />
      </button>
      <span className="pointer-events-none absolute bottom-16 right-4 rounded-full bg-black/65 px-3 py-1 text-sm text-white">{current + 1} / {photos.length} · Смотреть фото</span>
      {photos.length > 1 && <div className="absolute bottom-16 left-4 flex gap-2">{photos.map((src, i) => <button type="button" key={src} onClick={() => setIndex(i)} aria-label={`Фото ${i + 1}`} aria-pressed={current === i} className={`size-11 overflow-hidden rounded-lg border-2 ${current === i ? 'border-white' : 'border-transparent'}`}><img src={src} alt="" className="size-full object-cover" /></button>)}</div>}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background to-transparent" />
    </div>
    <dialog ref={dialog} aria-label="Просмотр фотографий объекта" className="fixed inset-0 m-auto h-dvh max-h-none w-screen max-w-none bg-black p-4 text-white backdrop:bg-black/90" onKeyDown={(event) => { if (event.key === 'ArrowLeft') move(-1); if (event.key === 'ArrowRight') move(1) }}>
      <div className="flex h-full flex-col gap-4">
        <header className="flex items-center justify-between"><p>Фото {current + 1} из {photos.length}</p><button autoFocus type="button" aria-label="Закрыть фотографии" className="grid size-11 place-items-center rounded-full bg-white/15" onClick={() => dialog.current?.close()}><X /></button></header>
        <img src={photos[current]} alt={`${propertyTitle(property)} · фото ${current + 1}`} className="min-h-0 flex-1 object-contain" />
        {photos.length > 1 && <footer className="flex justify-center gap-4"><button type="button" aria-label="Предыдущее фото" className="grid size-12 place-items-center rounded-full bg-white/15" onClick={() => move(-1)}><ChevronLeft /></button><button type="button" aria-label="Следующее фото" className="grid size-12 place-items-center rounded-full bg-white/15" onClick={() => move(1)}><ChevronRight /></button></footer>}
      </div>
    </dialog>
  </>
}
