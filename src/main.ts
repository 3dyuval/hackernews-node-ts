import { createYoga } from 'graphql-yoga'
import { createServer } from 'http'
import mongoose, { schema } from './schema'
import { createContext } from './context'

async function main() {
	const context = await createContext('hackernews')
	const yoga = createYoga({ schema, context  })
	const server = createServer(yoga)
	server.listen(4000, () => {
		console.info(`server is listening on http://localhost:4000/graphql`)
	})
}

main()
