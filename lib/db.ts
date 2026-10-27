import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import { pgTable, text, jsonb, timestamp } from 'drizzle-orm/pg-core'
export const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 })
export type ClientRecord = { id: string; name: string; request: string; next: string; date: string }
export const workspace = pgTable('prototype_workspace', {
  userId: text('userId').primaryKey(),
  profile: jsonb('profile').$type<{ name?: string; role?: string }>().notNull(),
  clients: jsonb('clients').$type<ClientRecord[]>().notNull(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})
export const db = drizzle(pool)
