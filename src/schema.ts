import { makeExecutableSchema } from '@graphql-tools/schema'
import type { GraphQLContext } from './context'

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

const resolvers = {
	Query: {
		info: () => 'This is an api from Hackernews',
		feed: async (parent: unknown, args: {}, context: GraphQLContext) =>
			await context.prisma.link.findMany(),
	},
	Mutation: {
		postLink: async (
			parent: unknown,
			args: { description: string; url: string },
			context: GraphQLContext
		) => await context.prisma.link.create({ data: args }),
	},
}

export const schema = makeExecutableSchema({
	resolvers: [resolvers],
	typeDefs: [typeDefinitions],
})
