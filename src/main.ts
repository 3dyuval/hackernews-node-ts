import { createYoga } from 'graphql-yoga'
import { createServer } from 'http'
import { schema } from './schema'
import { createContext } from './context'
import { useAuth0 } from '@envelop/auth0'
import http from 'http'
import fs from 'fs'



const PORT_HTML = 4001;
const PORT_UI = 4000;


fs.readFile('src/client/index.html', (error, html) => {
	const headers = {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Methods": "OPTIONS, POST, GET",
		"Access-Control-Max-Age": 2592000, // 30 days
		"Content-Type": "text/html",
	  };

	if (error) throw error
	http.createServer((req, res) => {
		res.writeHead(200, headers)
		res.write(html)
		res.end()
	}).listen(PORT_HTML)

})

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
	server.listen(PORT_UI, () => {
		console.info(`server is listening on http://localhost:4000/graphql`)
	})
}

main()
