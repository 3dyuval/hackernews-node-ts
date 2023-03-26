import { makeExecutableSchema } from '@graphql-tools/schema'
import { Link } from '@prisma/client'
import { Prisma } from '@prisma/client'
import { GraphQLError } from 'graphql'
import type { GraphQLContext } from './context'

const typeDefinitions = /* GraphQL */ `
	type Query {
		info: String!
		feed: [Link!]!
		comment(id: ID!): Comment
		link(id: ID!): Link
		sub: String
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
		sub: (root: any, args: any, context: any) => {
			const auth0UserId = context.auth0.sub
			return auth0UserId
		},
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
		async postLink (
			parent: unknown,
			args: { description: string; url: string },
			context: GraphQLContext
		) {
			return await context.prisma.link.create({
				data: {
					description: args.description,
					url: args.url,
				},
			})
		},
		async postCommentOnLink(
			parent: unknown,
			args: { linkId: string; body: string },
			context: GraphQLContext
		  ) {
			const comment = await context.prisma.comment
			  .create({
				data: {
				  body: args.body,
				  linkId: parseInt(args.linkId)
				}
			  })
			  .catch((e: unknown) => {
				if (
				  e instanceof Prisma.PrismaClientKnownRequestError &&
				  e.code === 'P2003'
				) {
				  return Promise.reject(
					new GraphQLError(
					  `Cannot post comment on non-existing link with id '${args.linkId}'.`
					)
				  )
				}
				return Promise.reject(e)
			  })
			return comment
		  }
	  },
	Link: {
		 async comments (parent: Link, args: {}, context: GraphQLContext) {
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
