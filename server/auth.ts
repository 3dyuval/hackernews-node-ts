import FusionAuthClient from '@fusionauth/typescript-client';
import { Plugin } from 'graphql-yoga';
import * as jose from 'jose';
import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { logger } from './main';

const clientId = process.env.FUSION_AUTH_CLIENT_ID;
const clientSecret = process.env.FUSION_AUTH_CLIENT_SECRET;
const fusionAuthURL = process.env.FUSION_AUTH_BASE_URL;
const client = new FusionAuthClient('noapikeyneeded', fusionAuthURL);

export async function authenticateUser(prisma: PrismaClient, request: Request): Promise<User> {
  const cookieHeader = request.headers.get('cookie')?.split(';');

  if (!cookieHeader) return null;

  const cookies = {};
  for (var i = 0; i < cookieHeader.length; i++) {
    var cookie = cookieHeader[i].trim();
    // Split the cookie into name and value
    var cookieParts = cookie.split('=');
    var cookieName = cookieParts[0];
    var cookieValue = cookieParts[1];
    cookies[cookieName] = cookieValue;
  }

  const spki = await getCertificates();

  const sub = await jose
    .importSPKI(spki, 'HS256')
    .then((key) => jose.jwtVerify(cookies['app.at'], key))
    .then((res) => res.payload.sub)
    .catch((res) => {
      logger.warn(res)
      return null
    });

  return sub;
}

async function getCertificates(): Promise<string> {
  let cert: any = await fs.promises.readFile(path.resolve(process.cwd(), 'cert', 'public-key.pem'), { encoding: 'utf8' });
  // const jwk: [JWK] = await fetch(new URL(`${fusionAuthURL}/.well-known/jwks.json`)).then((res) => res.json());
  // let cert = await JWK.asKey(jwk.keys[0]).then((key) => key.toPEM());
  return cert;
}

export type User = string | null;

export function useAuth(): Plugin {
  const whitelist = ['http://localhost:3030'];

  return {
    onResponse({ request, response }) {
      if (request.method === 'OPTIONS') {
        if (whitelist.includes(request.headers.get('origin'))) {
          response.headers.set('Access-Control-Allow-Credentrials', 'true');
        } else {
          response.headers.delete('Access-Control-Allow-Credentials');
        }
      }
      response.headers.set('X-GraphQL-Server', 'Yoga');
    },
  };
}
