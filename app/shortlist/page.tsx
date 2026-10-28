import type { Metadata } from 'next'
import { ClientShortlist } from '@/components/client-shortlist'
export const metadata: Metadata = { title: 'Ваша подборка — SuperApp', description: 'Сравните варианты и подготовьте обратную связь по подборке.', robots: { index: false, follow: false } }
export default function Page() { return <ClientShortlist /> }
