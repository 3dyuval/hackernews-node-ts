import { PrismaClient } from '@prisma/client'
import { db} from '../drizzle/schema'

const prisma = new PrismaClient()

export type GraphQLContext = {
	prisma: PrismaClient
	db: typeof db
}

export function createContext(): GraphQLContext {
	return {
		prisma,
		db
	}
}

