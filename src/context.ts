import { client } from '../mongodb/schema'


export type GraphQLContext = {
	client: typeof client
}

export function createContext(): GraphQLContext {
	return {
		client
	}
}

