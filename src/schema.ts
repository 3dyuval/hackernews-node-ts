import { makeExecutableSchema } from '@graphql-tools/schema'
import { Link } from '@prisma/client'
import type { GraphQLContext } from './context'

const typeDefinitions = /* GraphQL */ `
	type Query {
		info: String!
		feed: [Link!]!
		comment(id: ID!): Comment
		link(id: ID!): Link
	}
	type Mutation {
		postLink(url: String!, description: String!): Link!
		postCommentOnLink(linkId: ID!, body: String!): Comment!
	}
	type Link {
		id: ID!
		description: String!
		url: String!
		comments: [Comment]
	}
	type Comment {
		id: ID!
		body: String!
		link: Link
	}
`

const resolvers = {
	Query: {
		info: () => 'This is an api from Hackernews',
		feed: async (parent: unknown, args: {}, context: GraphQLContext) => {
			return await context.prisma.link.findMany()
		},
		comment: async (
			parent: unknown,
			args: { id: string },
			context: GraphQLContext
		) => {
			return await context.prisma.comment.findUnique({
				where: { id: parseInt(args.id) },
			})
		},
		link: async (
			parent: unknown,
			args: { id: string },
			context: GraphQLContext
		) => {
			return context.prisma.link.findUnique({
				where: { id: parseInt(args.id) },
			})
		},
	},
	Mutation: {
		postLink: async (
			parent: unknown,
			args: { description: string; url: string },
			context: GraphQLContext
		) => {
			return await context.prisma.link.create({
				data: {
					description: args.description,
					url: args.url,
				},
			})
		},
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
	Link: {
		comments: async (parent: Link, args: {}, context: GraphQLContext) => {
			return context.prisma.comment.findMany({
				where: { linkId: parent.id },
			})
		},
	},
}

export const schema = makeExecutableSchema({
	resolvers: [resolvers],
	typeDefs: [typeDefinitions],
})
