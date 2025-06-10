import dotenv from 'dotenv';
import findConfig from 'find-config';
import Account from './utils/account.js';
import jwks from './utils/jwks.js';

// Find the nearest .env and load it into process.ENV
dotenv.config({ path: findConfig('.env') });

const authInteractionSecret = process.env.AUTH_INTERACTION_COOKIE_SECRET;

if (!authInteractionSecret) {
  throw new Error('Missing env variable AUTH_INTERACTION_COOKIE_SECRET');
}

const clients = [
  {
    client: {
      client_id: process.env.CLIENT1_CLIENT_ID,
      client_secret: process.env.CLIENT1_CLIENT_SECRET || '',
      redirect_uris: [process.env.CLIENT1_CALLBACK],
      grant_types: ['authorization_code', 'urn:ietf:params:oauth:grant-type:token-exchange'],
    },
    extra: {
      resource: process.env.APP_RESOURCE,
    },
  },
];

if (process.env.CLIENT2_CLIENT_ID) {
  console.log('Configuring CLIENT2');
  clients.push({
    client: {
      client_id: process.env.CLIENT2_CLIENT_ID,
      client_secret: process.env.CLIENT2_CLIENT_SECRET || '',
      redirect_uris: [process.env.CLIENT2_CALLBACK || 'http://this/is/not/actually/needed'],
      grant_types: ['authorization_code', 'urn:ietf:params:oauth:grant-type:jwt-bearer'],
    },
    extra: {
      resource: process.env.APP_RESOURCE,
    },
  });
}

const configuration = {
  clients: clients.map((c) => c.client),
  findAccount: Account.findAccount,
  providers: {
    customer1: {
      name: 'customer1',
      email_domains: [process.env.CUSTOMER1_EMAIL_DOMAIN],
      issuer: process.env.CUSTOMER1_AUTH_ISSUER,
      authorization_endpoint: `${process.env.CUSTOMER1_AUTH_ISSUER}/oauth2/v1/authorize`,
      token_endpoint: `${process.env.CUSTOMER1_AUTH_ISSUER}/oauth2/v1/token`,
      userinfo_endpoint: `${process.env.CUSTOMER1_AUTH_ISSUER}/oauth2/v1/userinfo`,
      redirect_uri: `${process.env.AUTH_SERVER}/openid/callback/customer1`,
      client_id: process.env.CUSTOMER1_CLIENT_ID,
      client_secret: process.env.CUSTOMER1_CLIENT_SECRET,
      use_saml_sso: process.env.USE_SAML_SSO === 'true',
      scope: 'profile email',
      pkce: true,
    },
    customer2: {
      name: 'customer2',
      email_domains: [process.env.CUSTOMER2_EMAIL_DOMAIN],
      issuer: process.env.CUSTOMER2_AUTH_ISSUER,
      authorization_endpoint: `${process.env.CUSTOMER2_AUTH_ISSUER}/oauth2/v1/authorize`,
      token_endpoint: `${process.env.CUSTOMER2_AUTH_ISSUER}/oauth2/v1/token`,
      userinfo_endpoint: `${process.env.CUSTOMER2_AUTH_ISSUER}/oauth2/v1/userinfo`,
      redirect_uri: `${process.env.AUTH_SERVER}/openid/callback/customer2`,
      client_id: process.env.CUSTOMER2_CLIENT_ID,
      client_secret: process.env.CUSTOMER2_CLIENT_SECRET,
      use_saml_sso: process.env.USE_SAML_SSO === 'true',
      scope: 'profile email',
      pkce: true,
    },
    customer3: {
      name: 'customer3',
      email_domains: [process.env.CUSTOMER3_EMAIL_DOMAIN],
      issuer: process.env.CUSTOMER3_AUTH_ISSUER,
      authorization_endpoint: `${process.env.CUSTOMER3_AUTH_ISSUER}/oauth2/v1/authorize`,
      token_endpoint: `${process.env.CUSTOMER3_AUTH_ISSUER}/oauth2/v1/token`,
      userinfo_endpoint: `${process.env.CUSTOMER3_AUTH_ISSUER}/oauth2/v1/userinfo`,
      redirect_uri: `${process.env.AUTH_SERVER}/openid/callback/customer3`,
      client_id: process.env.CUSTOMER3_CLIENT_ID,
      client_secret: process.env.CUSTOMER3_CLIENT_SECRET,
      use_saml_sso: process.env.USE_SAML_SSO === 'true',
      scope: 'profile email',
      pkce: true,
    },
  },
  features: {
    // userinfo disabled means that the profile info will get stored as claims on the idtoken jwt
    userinfo: { enabled: false },
    registration: { enabled: true },
    introspection: { enabled: true },
    resourceIndicators: {
      enabled: true,
      defaultResource: function (_, client) {
        const clientConfig = clients.find((c) => c.client.client_id === client.clientId);
        return clientConfig.extra.resource;
      },
      useGrantedResource: () => true,
      getResourceServerInfo: function (_, resource) {
        return {
          scope: 'read write',
          audience: resource,
          accessTokenTTL: 2 * 60 * 60,
          accessTokenFormat: 'jwt',
          jwt: {
            sign: { alg: 'RS256' },
          },
        };
      },
    },
    devInteractions: { enabled: false },
  },
  extraTokenClaims: function (_, token) {
    return {
      app_org: Account.getOrgId(token.accountId),
    };
  },
  claims: {
    // default values - start
    acr: null,
    auth_time: null,
    iss: null,
    openid: ['sub'],
    sid: null,
    // default values - end

    // custom claims - start
    address: ['address'],
    email: ['email', 'email_verified'],
    phone: ['phone_number', 'phone_number_verified'],
    profile: [
      'birthdate',
      'family_name',
      'gender',
      'given_name',
      'locale',
      'middle_name',
      'name',
      'nickname',
      'picture',
      'preferred_username',
      'profile',
      'updated_at',
      'website',
      'zoneinfo',
      'app_org',
    ],
    // custom claims - end
  },
  cookies: {
    keys: [authInteractionSecret],
    short: {
      path: '/',
    },
  },
  interactions: {
    url(_, interaction) {
      return `/interaction/${interaction.uid}`;
    },
  },
  pkce: {
    required: () => false,
  },
};

const makeConfiguration = async () => {
  if (!configuration.jwks) {
    configuration.jwks = { keys: await jwks() };
  }

  return configuration;
};

export default makeConfiguration;
