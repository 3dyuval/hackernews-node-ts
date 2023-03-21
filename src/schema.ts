import { makeExecutableSchema } from '@graphql-tools/schema'
import { PrismaClient } from '@prisma/client'

const typeDefinitions = /* GraphQL */ `
	type Query {
		info: String!
		feed: [Link!]!
	}
	type Mutation {
		postLink(url: String!, description: String!): Link!
	}
	type Link {
		id: ID!
		description: String!
		url: String!
	}
`

type Link = {
	id: string
	url: string
	description: string
}

const links: Link[] = [
	{
		id: 'link-1',
		url: 'www',
		description: 'link1',
	},
]

const prisma = new PrismaClient()

const resolvers = {
	Query: {
		info: () => 'This is an api from Hackernews',
		feed: async () => await prisma.link.findMany(),
	},
	Mutation: {
		postLink: async (
			parent: unknown,
			args: { description: string; url: string }
		) => await prisma.link.create({ data: args }),
	},
}

export const schema = makeExecutableSchema({
	resolvers: [resolvers],
	typeDefs: [typeDefinitions],
})
