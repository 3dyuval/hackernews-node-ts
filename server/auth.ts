import FusionAuthClient from '@fusionauth/typescript-client';
import { Plugin, YogaInitialContext } from 'graphql-yoga';
import { ResolveUserFn } from '@envelop/generic-auth';
import * as jose from 'jose';
import fs from 'node:fs';
import { PrismaClient } from '@prisma/client';

// let spkc
// fs.readFile('cert/public-key.pem', {encoding: 'ascii'}, res => spkc = res);
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const fusionAuthURL = process.env.BASE_URL;

const client = new FusionAuthClient('noapikeyneeded', fusionAuthURL);

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

export async function authenticateUser(prisma: PrismaClient, request: Request): Promise<User> {
  const cookieHeader = request.headers.get('cookie').split(';');
  const cookies = {};
  for (var i = 0; i < cookieHeader.length; i++) {
    var cookie = cookieHeader[i].trim();
    // Split the cookie into name and value
    var cookieParts = cookie.split('=');
    var cookieName = cookieParts[0];
    var cookieValue = cookieParts[1];
    cookies[cookieName] = cookieValue;
  }

  let spki = `-----BEGIN PUBLIC KEY-----
  MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvW723HDsnj+UvD5KXbDt
  UeKJMqLw8MP8jL/7k5v/abYFCTk5Cyu4fkwEf0lxFm0rRudEvQxVpUT0VyGHKZw3
  eLGIupUcf337rdLE9D85RmGWzt5U0c7iu5dMaOOoXlpM6dbK9NMr6j7593EeaYLl
  YazyZxYQYg1UC3q9LI2TrT7Tq/KPU6/Zdq8j6f1KL5cBCJDPi0O7WzJZVBLb9swk
  tNDcELuveGfU7dZWsvP+4Mg/fyIwL5Qi2XI7qF87CMp0nuFTdnGO2fhsNzgMppvk
  Y0bO0BdMS4CYjBG3lOhpifh/A7NFZnifCmC7o4u3Z1/c9CC8vyO5A2mKsM8Led8P
  QwIDAQAB
  -----END PUBLIC KEY-----`;

  const sub = await jose
    .importSPKI(spki, 'HS256')
    .then((key) => jose.jwtVerify(cookies['app.at'], key))
    .then((res) => res.payload.sub)
    .catch(console.error);

  return sub || null;
}
