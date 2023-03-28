import { drizzle } from 'drizzle-orm/node-postgres'
import {eq} from 'drizzle-orm/expressions'
import {pgTable, serial, integer, varchar, timestamp,  } from 'drizzle-orm/pg-core'
import {sql} from 'drizzle-orm/sql'
import {InferModel} from 'drizzle-orm'
import {Pool} from 'pg'

export const link = pgTable('Link', {
    id: serial('id').primaryKey(),
    url: varchar('url', {length: 80}).notNull(),
    description: varchar('description', {length: 20}).notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
})

export const comment = pgTable('Comment', {
    id: serial('id').primaryKey(),
    body: varchar('body', {length: 40}).notNull(),
    linkId: integer('linkId').references(() => link.id)
})


const pool = new Pool({
    connectionString: 'postgres://postgres:postgres@localhost:5432/hackernews'
})

export const db = drizzle(pool)

export type Link = InferModel<typeof link>;
export type Comment = InferModel<typeof comment>;
