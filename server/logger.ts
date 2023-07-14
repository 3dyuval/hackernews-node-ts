import winston from 'winston';


export default winston.createLogger({
    format: winston.format.json(),
    transports: [
      new winston.transports.File({ filename: `${process.cwd()}/logs/error.log`, level: 'error' }),
      new winston.transports.File({ filename: `${process.cwd()}/logs/combined.log` }),
      new winston.transports.Console(),
    ],
  });