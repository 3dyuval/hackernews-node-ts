import { PrismaClient } from '@prisma/client'
import { authenticateUser, User } from './auth'

const prisma = new PrismaClient({
	log: ['query']
})

export type GraphQLContext = {
	prisma: PrismaClient
	userId: User

}

export async function createContext({req, res}): Promise<GraphQLContext> {
	return {
		prisma,
		userId: await authenticateUser(req)
	}
}
