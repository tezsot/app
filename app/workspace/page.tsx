import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db, workspace } from '@/lib/db'
import { WorkspaceView } from '@/components/workspace-view'
export default async function WorkspacePage() {
 const session = await auth.api.getSession({ headers: await headers() })
 if (!session) redirect('/sign-in')
 const [data] = await db.select().from(workspace).where(eq(workspace.userId, session.user.id))
 return <WorkspaceView profile={data?.profile ?? {}} clients={data?.clients ?? []} />
}
