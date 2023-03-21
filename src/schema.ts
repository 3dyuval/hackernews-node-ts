import { makeExecutableSchema } from '@graphql-tools/schema'
import type { GraphQLContext } from './context'

const typeDefinitions = /* GraphQL */ `
	type Query {
		info: String!
		feed: [Link!]!
		comment(id: ID!): Comment
	}
	type Mutation {
		postLink(url: String!, description: String!): Link!
		postCommentOnLink(linkId: ID!, body: String!): Comment!
	}
	type Link {
		id: ID!
		description: String!
		url: String!
	}
	type Comment {
		id: ID!
		body: String!
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
		) =>
			await context.prisma.link.create({
				data: {
					description: args.description,
					url: args.url,
				},
			}),
		postCommentOnLink: async (
			parent: unknown,
			args: { linkId: string; body: string },
			context: GraphQLContext
		) => {
			return await context.prisma.comment.create({
				data: {
					linkId: parseInt(args.linkId),
					body: args.body,
				},
			})
		},
	},
}

export const schema = makeExecutableSchema({
	resolvers: [resolvers],
	typeDefs: [typeDefinitions],
})
