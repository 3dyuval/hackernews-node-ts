import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv'
dotenv.config()


const dbURL = process.env.MONGODB_URL!
if (!dbURL) throw new Error ('Mongo DB URL not found in environment')

 export const client = new MongoClient(dbURL)

    