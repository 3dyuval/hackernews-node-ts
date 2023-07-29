import { drizzle } from 'drizzle-orm/node-postgres';
import { pgTable, serial, integer, varchar, timestamp, uuid, text } from 'drizzle-orm/pg-core';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { InferModel } from 'drizzle-orm';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

//TODO SEED+CONNECT POSTGRES

//TODO MIGRATE RECENT PRISMA MODELS

export const link = pgTable('Link', {
  id: serial('id').primaryKey(),
  url: varchar('url', { length: 200 }).notNull(),
  description: varchar('description', { length: 100 }).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  userId: uuid('userId'),
  topic: text('topic'),
});

export const comment = pgTable('Comment', {
  id: serial('id').primaryKey(),
  body: varchar('body', { length: 500 }).notNull(),
  linkId: integer('linkId').references(() => link.id),
  parentId: text('parentId'),
});

const pool = new Pool({
  user: process.env['DB_POSTGRES_USER'],
  password: process.env['DB_POSTGRES_PASSWORD'],
  port: parseInt(process.env['DB_POSTGRES_PORT']),
  host: process.env['DB_POSTGRES_HOST'],
});

export const db = drizzle(pool);

migrate(db, { migrationsFolder: `${process.cwd()}/drizzle` });

export type Link = InferModel<typeof link>;
export type Comment = InferModel<typeof comment>;
