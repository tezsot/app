import type { Metadata, Viewport } from 'next'
import { ExperienceV2 } from '@/components/v2/experience'

export const metadata: Metadata = { title: 'Маклер V2 — ваш следующий шаг', description: 'Отдельный демонстрационный сценарий персонального рабочего пространства риелтора.' }
export const viewport: Viewport = { width: 'device-width', initialScale: 1, maximumScale: 5, userScalable: true, themeColor: '#ffffff' }

export default function Page() { return <ExperienceV2 /> }
