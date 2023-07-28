import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { schema } from './schema';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { createContext as context } from './context';
import cors from 'cors';
import { json } from 'body-parser';
import { createServer } from 'node:http';
import express from 'express';
import { whitelist } from './auth';

const PORT = 4000;

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
