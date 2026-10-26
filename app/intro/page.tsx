import type { Metadata } from 'next'
import { Intro } from '@/components/intro/intro'

export const metadata: Metadata = { title: 'SuperApp — знакомство', description: 'От первого обращения до сделки: познакомьтесь с рабочим пространством риэлтора.' }
export default function Page() { return <Intro /> }
