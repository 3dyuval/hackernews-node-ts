import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
import { authenticateUser, User } from './auth'

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
