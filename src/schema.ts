import { makeExecutableSchema } from '@graphql-tools/schema'
import { Link } from '@prisma/client'
<<<<<<< HEAD
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'
import { GraphQLError } from 'graphql'
=======
>>>>>>> a44e54d8557bc9bbc2f98468dcc53c4b3e390457
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
<<<<<<< HEAD
		postCommentOnLink(
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
		}
	  }
=======
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
>>>>>>> a44e54d8557bc9bbc2f98468dcc53c4b3e390457
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
