import { Auth0Client } from '@auth0/auth0-spa-js';

const a0 = new Auth0Client({
    domain: 'me-pong.eu.auth0.com',
    clientId: 'zy7jOrdlN1afeLOKXhsFdJhdPcaOLWLk',
    scope: 'openid profile email',
    audience: 'yuval.live/graphql'
})

const loginButton = document.querySelector('.login')
const logoutButton = document.querySelector('.logout')

loginButton.addEventListener('click', async () => {
    await a0.loginWithRedirect({    authorizationParams: {
        audience: 'yuval.live/graphql',
        redirect_uri: 'http://localhost:4000/graphql'
      }});
      const user = await a0.getUser();
      console.log(user);
  })

logoutButton?.addEventListener('click', async () => {
    await a0.logout()
})