import * as jose from 'jose';
import fs from 'node:fs';
import path from 'node:path';
import { logger } from './logger';
export async function authenticateUser(request: Request): Promise<User> {
  const cookieHeader = request.headers?.['cookie']?.split(';');

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

  const spki = await getCertificates().catch((err) => {
    logger.error(err);
    return null;
  });

  const sub = await jose
    .importSPKI(spki, 'HS256')
    .then((key) => jose.jwtVerify(cookies['app.at'], key))
    .then((res) => res.payload.sub)
    .catch((res) => {
      logger.warn(res);
      return null;
    });

  return sub;
}

async function getCertificates(): Promise<string> {
  return await fs.promises
    .readFile(path.resolve(process.cwd(), 'cert', 'public-key.pem'), { encoding: 'utf8' })
    .catch((err) => {
      throw new Error(
        `Unable to read local file ''public-key.pem.
      This certificate is required to authenticate user requests.
    `
      );
    });
}

export type User = string | null;
export const whitelist = ['http://localhost:3030'];
