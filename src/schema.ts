import { makeExecutableSchema } from '@graphql-tools/schema'
import { GraphQLError } from 'graphql'
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
			return await context.db.collection('Link').find()
		},
		comment: async (
			parent: unknown,
			args: { id: string },
			context: GraphQLContext
		) => {
			return await context.db.collection('Comment').find({id: args.id})
		},
		link: async (
			parent: unknown,
			args: { id: string },
			context: GraphQLContext
		) => {
			return await context.db.collection('Link').find({id: args.id})
		},
	},
	Mutation: {
		async postLink (
			parent: unknown,
			args: { description: string; url: string },
			context: GraphQLContext
		) {
			return null
			// return await context.db.insert(link).values({
			// 	description: args.description,
			// 	url: args.url
			// })
		},
		async postCommentOnLink(
			parent: unknown,
			args: { linkId: string; body: string },
			context: GraphQLContext
		  ) {
			return null
		  }
			// const newComment = await context.db.insert(comment).values({
			// 	body: args.body,
			// 	linkId: parseInt(args.linkId)
			// })
		// 	  .catch((e: unknown) => {
		// 		if (
		// 		  e
		// 		) {
		// 		  return Promise.reject(
		// 			new GraphQLError(
		// 			  `Cannot post comment on non-existing link with id '${args.linkId}'.`
		// 			)
		// 		  )
		// 		}
		// 		return Promise.reject(e)
		// 	  })
		// 	return newComment
		//   }
	//   },
		},
	Link: {
		 async comments (parent: any, args: {}, context: GraphQLContext) {
			return null

			// return context.db.select().from(comment).where(eq(comment.linkId, parent.id))
		},
	},
}

export const schema = makeExecutableSchema({
	resolvers: [resolvers],
	typeDefs: [typeDefinitions],
})
