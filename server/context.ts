import { PrismaClient } from '@prisma/client';
import { authenticateUser, User } from './auth';
import { db } from '../drizzle/schema';

const prisma = new PrismaClient();

export type GraphQLContext = {
  prisma: PrismaClient;
  userId: User;
  db: typeof db;
};

export async function createContext({ req, res }): Promise<GraphQLContext> {
  return {
    prisma,
    userId: await authenticateUser(req),
    db,
  };
}
