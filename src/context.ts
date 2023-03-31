import {client} from '../mongodb/schema'
import {Db} from 'mongodb'

export type GraphQLContext = {
	client: typeof client
	db: Db
}

export async function createContext(dbName: string): Promise<GraphQLContext> {

	return {
		client,
		db: await client.db(dbName)
	}
}

