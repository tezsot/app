import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

export function HomeWorkflowLinks() {
  return <section className="mx-4 mb-6 rounded-[22px] bg-card p-4" aria-labelledby="workflow-title">
    <h2 id="workflow-title" className="text-base font-semibold">Не потерять договорённости</h2>
    <p className="mt-1 text-xs leading-5 text-muted-foreground">Отдельные демо-сценарии. Их заявки и ответы пока не синхронизируются с главной. При переходе текущие изменения могут сброситься.</p>
    <div className="mt-3 divide-y divide-separator">{[
      { href: '/inbox', title: 'Входящие обращения', text: 'Разобрать заявку, назначить ответственного и контакт' },
      { href: '/shortlist', title: 'Подборка глазами клиента', text: 'Проверить сценарий ответа и запроса показа' },
      { href: '/owner', title: 'Отчёт собственнику', text: 'Показы, причины отказов и план действий' },
      { href: '/team', title: 'Доступы команды', text: 'Проверить роли и передачу клиентов' },
    ].map(item => <Link key={item.href} href={item.href} className="flex min-h-14 items-center gap-3 py-3 focus-visible:outline-2"><span className="min-w-0 flex-1"><span className="block text-sm font-medium">{item.title}</span><span className="block text-xs leading-5 text-muted-foreground">{item.text}</span></span><ArrowUpRight className="size-4 shrink-0" aria-hidden /></Link>)}</div>
  </section>
}
