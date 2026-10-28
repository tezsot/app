import type { Metadata } from 'next'
import { TeamAccess } from '@/components/team-access'
export const metadata: Metadata = { title: 'Доступы команды — SuperApp', robots: { index: false, follow: false } }
export default function Page() { return <TeamAccess /> }
