import { makeExecutableSchema } from '@graphql-tools/schema'

const typeDefinitions = /* GraphQL */ `
	type Query {
		info: String!
		feed: [Link!]!
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
		id: '1',
		url: 'www',
		description: 'link1',
	},
]

const resolvers = {
	Query: {
		info: () => 'This is an api from Hackernews',
		feed: () => links,
	},
	Link: {
		id: (parent: Link) => parent.id,
		description: (parent: Link) => parent.description,
		url: (parent: Link) => parent.url,
	},
}

export const schema = makeExecutableSchema({
	resolvers: [resolvers],
	typeDefs: [typeDefinitions],
})
