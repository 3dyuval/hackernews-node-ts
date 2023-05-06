import { makeExecutableSchema } from '@graphql-tools/schema'
import { Link, Prisma } from '@prisma/client'
import { GraphQLError } from 'graphql'
import type { GraphQLContext } from './context'
import { nextBatch } from 'next-batch'
import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection'
import { GraphQLResolveInfo } from 'graphql'

export const typeDefinitions = /* GraphQL */ `
	interface Node {
		id: ID!
	}

	type LinkConnection {
		edges: [LinkEdge]
		pageInfo: PageInfo!
	}

	type LinkEdge {
		cursor: String!
		node: Link
		commentsCount: Int!
	}

	type PageInfo {
		hasNext: Boolean!
		hasPrevious: Boolean!
		startCursor: String
		endCursor: String
	}

	type Link implements Node {
		id: ID!
		topic: String
		description: String!
		url: String!
		comments: CommentConnection
	}

	type CommentConnection {
		edges: [CommentEdge]!
		pageInfo: PageInfo
	}

	type CommentEdge {
		cursor: String!
		node: [Comment]
	}

	type Comment implements Node {
		id: ID!
		body: String!
		link: LinkConnection
	}

	type Topic {
		id: String!
		name: String!
	}

	type Query {
		info: String!
		feed: LinkConnection!
		comment(id: ID!): Comment
		link(id: ID!): Link
		topic(id: String!): Topic
	}

	type Mutation {
		postLink(url: String!, description: String!): Link!
		postCommentOnLink(linkId: ID!, body: String!): Comment!
		createTopic(id: String!, name: String!): Topic!
	}
`

const resolvers = {
	Query: {
		info: () => 'Hackernews Clone',
		feed: async (parent: unknown, args: {}, context: GraphQLContext) => {
			const commentsCount = {
				include: { _count: { select: { linkComment: true } } },
			}

			const result = await findManyCursorConnection(
				() => context.prisma.link.findMany(commentsCount),
				() => context.prisma.link.count(),
				{ first: 3 }
			)

			const edges = result.edges.map(item => ({
				commentsCount: item.node._count.linkComment,
        ...item
			}))

      return {...result, edges}
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
			const id = parseInt(args.id)
			if (isNaN(id)) {
				return Promise.reject(
					new GraphQLError(`Not valid link Id: '${args.id}'`)
				)
			}

			const baseArgs = { where: { id } }
			const cursor = await findManyCursorConnection(
				() => context.prisma.link.findMany(baseArgs),
				() => context.prisma.link.count()
			)

			return cursor
			// const data = await context.prisma.link.findUnique({
			// 	where: { id },
			// 	include: { _count: { select: { linkComment: true } } },
			// })
			// return { ...data, commentsCount: data._count.linkComment }
		},
		topic: async (
			parent: unknown,
			args: { id: string },
			context: GraphQLContext
		) => {
			return context.prisma.topic.findUnique({
				where: { id: args.id },
			})
		},
	},
	Mutation: {
		async postLink(
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
						linkId: parseInt(args.linkId),
					},
				})
				.catch((e: Prisma.PrismaClientUnknownRequestError) => {
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
		},
		createTopic: async (
			parent: unknown,
			args: { id: string; name: string },
			context: GraphQLContext
		) => {
			const topic = await context.prisma.topic
				.create({
					data: {
						id: args.id,
						name: args.name,
					},
				})
				.catch((e: any) => {
					if (
						e instanceof Prisma.PrismaClientKnownRequestError &&
						e.code === 'P2002'
					) {
						return Promise.reject(
							new GraphQLError(
								`Cannot create topic with existing topic id '${args.id}'.`
							)
						)
					}
				})
			return topic
		},
	},
	Link: {
		async comments(parent: Link, args: {}, context: GraphQLContext) {
			const taskBatch = nextBatch({
				key: 'comments',
				batchHandler: async (linkIds: { id: number }[]) => {
					const comments = await context.prisma.comment.findMany({
						where: { linkId: { in: linkIds.map(key => key.id) } },
					})
					const result = new Map()
					linkIds.forEach(key => {
						result.set(
							key,
							comments.filter(comment => comment.linkId === key.id)
						)
					})
					return result
				},
			})
			return await taskBatch.add({ id: parent.id })
		},
	},
}

export const schema = makeExecutableSchema({
	resolvers: [resolvers],
	typeDefs: [typeDefinitions],
})
