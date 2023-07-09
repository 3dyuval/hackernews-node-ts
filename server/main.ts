import { schema } from './schema';
import { ApolloServer, ApolloServerOptions } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { createContext as context } from './context';
import winston from 'winston';

export const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: `${process.cwd()}/logs/error.log`, level: 'error' }),
    new winston.transports.File({ filename: `${process.cwd()}/logs/combined.log` }),
    new winston.transports.Console(),
  ],
});

async function main() {

  const server = new ApolloServer({schema});

  const { url } = await startStandaloneServer(server, {
    listen: {
      port: 4000
    },
    context
  });
  console.log(`🚀 server is listening on ${url} `);
}

main();
