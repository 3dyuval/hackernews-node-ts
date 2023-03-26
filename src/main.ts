import { createYoga } from 'graphql-yoga'
import { createServer } from 'http'
import { schema } from './schema'
import { createContext } from './context'
import { useAuth0 } from '@envelop/auth0'

async function main() {
	const yoga = createYoga({ 
		schema,
		context: createContext,
		plugins: [useAuth0({
			onError: (e) => console.error(e),
			domain: 'me-pong.eu.auth0.com',
			headerName: 'authorization',
			tokenType: 'Bearer',
			preventUnauthenticatedAccess: true,
			audience: 'yuval.live/graphql',
			extendContextField: 'auth0',

		})]
	 })
	const server = createServer(yoga)
	server.listen(4000, () => {
		console.info(`server is listening on http://localhost:4000/graphql`)
	})
}

main()
