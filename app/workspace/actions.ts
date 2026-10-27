'use server'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db, workspace } from '@/lib/db'

export async function saveWorkspace(form: FormData) {
 const session = await auth.api.getSession({ headers: await headers() })
 if (!session) return { error: 'Войдите снова, чтобы сохранить данные.' }
 const get = (key: string, max: number) => { const value = form.get(key); return typeof value === 'string' ? value.trim().slice(0, max) : '' }
 const action = get('action', 20)
 try {
 await db.transaction(async tx => {
  await tx.insert(workspace).values({ userId: session.user.id, profile: {}, clients: [] }).onConflictDoNothing()
  const [row] = await tx.select().from(workspace).where(eq(workspace.userId, session.user.id)).for('update')
  if (action === 'profile') {
   const name = get('name', 100), role = get('role', 30)
   if (!name || !['agent', 'manager'].includes(role)) throw new Error('invalid')
   await tx.update(workspace).set({ profile: { name, role }, updatedAt: new Date() }).where(eq(workspace.userId, session.user.id))
  } else if (action === 'client') {
   const name = get('name', 100), request = get('request', 1000), next = get('next', 300), date = get('date', 10)
   if (!row.profile.name || !name || !request || !next || !/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)) || row.clients.length >= 100) throw new Error('invalid')
   await tx.update(workspace).set({ clients: [...row.clients, { id: crypto.randomUUID(), name, request, next, date }], updatedAt: new Date() }).where(eq(workspace.userId, session.user.id))
  } else throw new Error('invalid')
 })
 revalidatePath('/workspace')
 return { success: true }
 } catch { return { error: 'Не удалось сохранить. Проверьте поля и повторите попытку; введённый текст не потерян.' } }
}
