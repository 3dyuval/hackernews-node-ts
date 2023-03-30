import { makeExecutableSchema } from '@graphql-tools/schema'
import { GraphQLError } from 'graphql'
import type { GraphQLContext } from './context'
import {link, comment, db} from '../drizzle/schema'
import {eq} from 'drizzle-orm/expressions'
import type { Link, Comment } from '../drizzle/schema'

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
			return await context.db.select().from(link)
		},
		comment: async (
			parent: unknown,
			args: { id: string },
			context: GraphQLContext
		) => {
			return await context.db.select().from(comment).where(eq(comment.id, parseInt(args.id)))
		},
		link: async (
			parent: unknown,
			args: { id: string },
			context: GraphQLContext
		) => {
			return await context.db.select().from(comment).where(eq(comment.id, parseInt(args.id)))
		},
	},
	Mutation: {
		async postLink (
			parent: unknown,
			args: { description: string; url: string },
			context: GraphQLContext
		) {
			return await context.db.insert(link).values({
				description: args.description,
				url: args.url
			})
		},
		async postCommentOnLink(
			parent: unknown,
			args: { linkId: string; body: string },
			context: GraphQLContext
		  ) {
			const newComment = await context.db.insert(comment).values({
				body: args.body,
				linkId: parseInt(args.linkId)
			})
			  .catch((e: unknown) => {
				if (
				  e
				) {
				  return Promise.reject(
					new GraphQLError(
					  `Cannot post comment on non-existing link with id '${args.linkId}'.`
					)
				  )
				}
				return Promise.reject(e)
			  })
			return newComment
		  }
	  },
	Link: {
		 async comments (parent: Link, args: {}, context: GraphQLContext) {
			return context.db.select().from(comment).where(eq(comment.linkId, parent.id))
		},
	},
}

export const schema = makeExecutableSchema({
	resolvers: [resolvers],
	typeDefs: [typeDefinitions],
})
