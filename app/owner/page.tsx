import type { Metadata } from 'next'
import { OwnerReport } from '@/components/owner-report'
export const metadata: Metadata = { title: 'Отчёт собственнику — SuperApp', description: 'Показы, обратная связь и следующие шаги по продаже объекта.', robots: { index: false, follow: false } }
export default function Page() { return <OwnerReport /> }
