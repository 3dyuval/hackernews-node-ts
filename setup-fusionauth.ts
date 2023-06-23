

const {FusionAuthClient} = require('@fusionauth/typescript-client');

let APPLICATION_ID = "cddc93d6-e4b3-4754-8bc5-b85e028fb789";
let RSA_KEY_ID = "31bceb6d-4cf9-46a6-b371-6b09a757b541"

const name = "Hackernews Clone"

let tenant , user

// You must supply your API key as an environment variable
const fusionAuthAPIKey = process.env.fusionauth_api_key;
if (! fusionAuthAPIKey ) {
  console.log("please set api key in the fusionauth_api_key environment variable")
  process.exit(1)
}

async function getTenant(client) {
  tenant = null
  try {
    let clientResponse = await client.retrieveTenants()
    tenant = clientResponse.response.tenants[0]
  } catch (error) {
    console.log("couldn't find tenants " + JSON.stringify(error))
    process.exit(1)
  }
  return tenant
}

async function patchTenant(client, tenant) {
  try {
    let clientResponse = await client.patchTenant(tenant["id"], {"tenant": {"issuer":"http://localhost:9011"}})
  } catch (error) {
    console.log("couldn't update tenant " + JSON.stringify(error))
    process.exit(1)
  }
}

async function generateKey(client) {
  try {
    let clientResponse = await client.generateKey(RSA_KEY_ID, {"key": {"algorithm":"RS256", "name":`For ${name}`, "length": 2048}})
  } catch (error) {
    console.log("couldn't create RSA key " + JSON.stringify(error))
    process.exit(1)
  }
}

async function enableCORS(client) {

  const corsObject = {
    "corsConfiguration": {
      "allowCredentials": true,
      "allowedHeaders": [ "Accept", "Access-Control-Request-Headers", "Access-Control-Request-Method", "X-Requested-With", "Authorization", "Content-Type", "Last-Modified", "Origin" ],
      "allowedMethods": [ "PUT", "GET", "POST", "OPTIONS" ],
      "allowedOrigins": [ "http://localhost:3030" ],
      "debug": false,
      "enabled": true,
      "exposedHeaders": [ "Access-Control-Allow-Origin", "Access-Control-Allow-Credential" ],
      "preflightMaxAgeInSeconds": 0
    },
  }

  try {
    let clientResponse = await client.patchSystemConfiguration({"systemConfiguration": corsObject})
  } catch (error) {
    console.log("couldn't create application " + JSON.stringify(error))
    process.exit(1)
  }

}

async function createApplication(client) {

const application = {}
  application["name"] = name

  application["oauthConfiguration"] = {}
  application["oauthConfiguration"]["authorizedRedirectURLs"] = ["http://localhost:3030"]

  application["oauthConfiguration"]["requireRegistration"] = true
  application["oauthConfiguration"]["enabledGrants"] = ["authorization_code", "refresh_token"]
  application["oauthConfiguration"]["logoutURL"] = "http://localhost:3030/"
  application["oauthConfiguration"]["clientSecret"] = "yBv77l82EGigoOApFFNZmwNUUuu23kG4OlU_1eO0uuE"

  // assign key from above to sign our tokens. This needs to be asymmetric
  application["jwtConfiguration"] = {}
  application["jwtConfiguration"]["enabled"] = true
  application["jwtConfiguration"]["accessTokenKeyId"] = RSA_KEY_ID
  application["jwtConfiguration"]["idTokenKeyId"] = RSA_KEY_ID

  try {
    let clientResponse = await client.createApplication(APPLICATION_ID, {"application": application})
  } catch (error) {
    console.log("couldn't create application " + JSON.stringify(error))
    process.exit(1)
  }
}

async function getUser(client) {
  let user = null
  try {
    // should only be one user
    let clientResponse = await client.searchUsersByQuery({"search": {"queryString":"*"}})
    user = clientResponse.response.users[0]
  } catch (error) {
    console.log("couldn't find user " + JSON.stringify(error))
    process.exit(1)
  }
  return user
}

// patch the user to make sure they have a full name, otherwise OIDC has issues
// TODO test check for errorResponse
async function patchUser(client, user) {
  try {
    let clientResponse = await client.patchUser(user["id"], {"user": {"fullName": user["firstName"]+" "+user["lastName"]}})
  } catch (error) {
    console.log("couldn't patch user " + JSON.stringify(error))
    process.exit(1)
  }
}

async function registerUser(client, user) {
  try {
    let clientResponse = await client.register(user["id"], {"registration":{"applicationId":APPLICATION_ID}})
  } catch (error) {
    console.log("couldn't register user " + JSON.stringify(error))
    process.exit(1)
  }
}

async function main(client) {
  tenant = await getTenant(client)
  await patchTenant(client, tenant)
  await generateKey(client)
  await createApplication(client)
  user = await getUser(client)
  await patchUser(client, user)
  await registerUser(client, user)
  await enableCORS(client)
  console.log(user)
}

const client = new FusionAuthClient(fusionAuthAPIKey, 'http://localhost:9011');

main(client)

