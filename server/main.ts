import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { schema } from './schema';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { createContext as context } from './context';
import winston from 'winston';
import cors from 'cors';
import { json } from 'body-parser';
import { createServer } from 'node:http';
import express from 'express';
import { whitelist } from './auth';

const PORT = 4000;
export const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: `${process.cwd()}/logs/error.log`, level: 'error' }),
    new winston.transports.File({ filename: `${process.cwd()}/logs/combined.log` }),
    new winston.transports.Console(),
  ],
});

async function main() {
  const app = express();
  const httpServer = createServer(app);
  const server = new ApolloServer({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();
  app.use(
    '/graphql',
    cors({ origin: whitelist, credentials: true }),
    (req, res, next) => {
      res.set('X-GraphQL-Server', 'Apollo');
      next();
    },
    json(),
    expressMiddleware(server, { context })
  );

  await new Promise<void>((resolve) => httpServer.listen({ port: PORT }, resolve));
  console.log(`🚀 server is listening on [http://localhost:${PORT}]`);
}

main();
