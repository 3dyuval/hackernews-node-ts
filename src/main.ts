import { createYoga } from 'graphql-yoga'
import { createServer } from 'http'
import { schema } from './schema'
import { createContext } from './context'

const PORT = process.env.PORT || 3000
async function main() {
	const yoga = createYoga({ schema, context: createContext })
	const server = createServer(yoga)
	server.listen(PORT, () => {
		console.info(`server is listening on http://localhost:${PORT}/graphql`)
	})
}

main()
