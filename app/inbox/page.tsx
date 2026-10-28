import type { Metadata } from 'next'
import { LeadInbox } from '@/components/lead-inbox'
export const metadata: Metadata = { title: 'Входящие обращения — SuperApp', robots: { index: false, follow: false } }
export default function Page() { return <LeadInbox /> }
