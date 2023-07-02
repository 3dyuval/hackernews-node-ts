import { createYoga } from 'graphql-yoga';
import { createServer } from 'http';
import { schema } from './schema';
import { createContext } from './context';
import { express as voyagerExpress } from 'graphql-voyager/middleware';
import express from 'express'


import { useAuth } from './auth';
import winston from 'winston';

export const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: `${process.cwd()}/logs/error.log`, level: 'error' }),
    new winston.transports.File({ filename: `${process.cwd()}/logs/combined.log` }),
    new winston.transports.Console()
  ],
});


async function main() {

  const yoga = createYoga({
    schema,
    context: createContext,
    logging: {
        debug(...args) {
          logger.debug(args)
        },
        info(...args) {
          logger.info(args)
        },
        warn(...args) {
          logger.warn(args)
        },
        error(...args) {
          logger.error(args)
        }
    },
    plugins: [useAuth()],
  });

  return express()
  .use(yoga.graphqlEndpoint, yoga)
  .use('/voyager', voyagerExpress({ endpointUrl: yoga.graphqlEndpoint }))
  .listen(4000, () => {
    console.info('Yoga and Voyager server is listening on port 4000')
  })

}

main()
