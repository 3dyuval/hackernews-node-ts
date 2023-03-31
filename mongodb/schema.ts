import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv'
dotenv.config()


const dbURI = process.env.MONGODB_URL!
if (!dbURI) throw new Error ('Mongo DB URI not found in environment')

export const client = new MongoClient(dbURI)
