import { createYoga } from 'graphql-yoga';
import { createServer } from 'http';
import { schema } from './schema';
import { createContext } from './context';
import { useGenericAuth } from '@envelop/generic-auth';
import {  useAuth } from './auth';

async function main() {
  const yoga = createYoga({
    schema,
    context: createContext,
    plugins: [useAuth()],
  }, );
  const server = createServer(yoga);
  server.listen(4000, () => {
    console.info(`server is listening on http://localhost:4000/graphql`);
  });
}

main();
