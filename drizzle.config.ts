import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config();

export default {
  schema: './db/drizzle.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    user: process.env['DB_POSTGRES_USER'],
    password: process.env['DB_POSTGRES_PASSWORD'],
    port: parseInt(process.env['DB_POSTGRES_PORT']),
    host: process.env['DB_POSTGRES_HOST'],
    database: process.env['DB_POSTGRES_CLIENT_DATABASE_NAME'],
  },
} satisfies Config;
