import * as dotenv from 'dotenv'
import mongoose from 'mongoose';
dotenv.config()


const dbURL = process.env.MONGODB_URL!
if (!dbURL) throw new Error ('Mongo DB URL not found in environment')

const Schema = new mongoose.Schema({
    //TODO
})