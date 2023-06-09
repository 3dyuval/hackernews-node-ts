import { createYoga } from 'graphql-yoga'
import { createServer } from 'http'
import { schema } from './schema'
import { createContext } from './context'

async function main() {
	const yoga = createYoga({ schema, context: createContext })
	const server = createServer(yoga)
	server.listen(4000, () => {
		console.info(`server is listening on http://localhost:4000/graphql`)
	})
}

main()
