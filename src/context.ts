import { db} from '../drizzle/schema'


export type GraphQLContext = {
	db: typeof db
}

export function createContext(): GraphQLContext {
	return {
		db
	}
}

