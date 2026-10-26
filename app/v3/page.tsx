import type { Metadata } from 'next'
import { IntroExperience } from '@/components/v3/intro-experience'

export const metadata: Metadata = { title: 'PropTech — меньше рутины, больше внимания клиентам', description: 'Новое знакомство: от запроса клиента до следующего шага. Независимый демонстрационный концепт V3.' }

export default function Page() { return <IntroExperience /> }
