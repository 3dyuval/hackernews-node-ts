import { PrismaClient } from '@prisma/client'
import { authenticateUser, User } from './auth'
const prisma = new PrismaClient({
	log: ['query']
})

export type GraphQLContext = {
	prisma: PrismaClient
	userId: User

}

export async function createContext({request}): Promise<GraphQLContext> {
	return {
		prisma,
		userId: await authenticateUser(prisma, request)
	}
}
