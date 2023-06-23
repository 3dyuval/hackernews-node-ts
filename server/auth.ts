import { Url } from './../prisma/Api';
import FusionAuthClient from '@fusionauth/typescript-client';
import { Plugin, YogaInitialContext } from 'graphql-yoga';
import { ResolveUserFn } from '@envelop/generic-auth';
// import  from "pkce-challenge";

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const fusionAuthURL = process.env.BASE_URL;

const client = new FusionAuthClient('noapikeyneeded', fusionAuthURL);

type UserType = any;

export const auth: ResolveUserFn<UserType> = async (context: any) => {
  // Make sure to either return `null` or the user object.
  const stateValue =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);

  context.req.session.stateValue = stateValue;
  const authorization = context.req.headers;

  //generate the pkce challenge/verifier dict
  // const pkce_pair = await import("pkce-challenge")
  // Store the PKCE verifier in session
  // context.req.session.verifier = pkce_pair['code_verifier'];
  // const challenge = pkce_pair['code_challenge'];

  // const verified = (await verifyChallenge(challenge, context.req.session.stateValue))
};

export function useAuth(): Plugin {
  const whitelist = ['http://localhost:3030'];

  return {
    onRequest({ request }) {
      //  a browser that respect redirects
      // a single source of truth for user authentication data (often called an identity provider)
      // a defined protocol for an application to bounce an unauthenticated user to the identity provider
      // a defined protocol for the identity provider to bounce requests back to the application
      // a sessions for each application (typically managed with cookies)
      // if (!request.headers.get('authorization')) {
      //  headers = request.options.headers;
      // const cookies = request.cookie
      const cookies = request.headers.get('cookie').split(';')
      for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim();
        
        // Split the cookie into name and value
        var cookieParts = cookie.split('=');
        var cookieName = cookieParts[0];
        var cookieValue = cookieParts[1];
      
        // Print the cookie name and value
        console.log('Cookie Name:', cookieName);
        console.log('Cookie Value:', cookieValue);
      }
      // fusionauth.sso
    },

    onResponse({ request, response }) {
      if (request.method === 'OPTIONS') {
        if (whitelist.includes(request.headers.get('origin'))) {
          response.headers.set('Access-Control-Allow-Credentrials', 'true');
        } else {
          response.headers.delete('Access-Control-Allow-Credentials')
        }
      }
      response.headers.set('X-GraphQL-Server', 'Yoga');
    },
  };
}
