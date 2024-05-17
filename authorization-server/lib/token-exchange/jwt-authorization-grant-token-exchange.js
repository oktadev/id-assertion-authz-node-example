import { OAuthBadRequest, requestIdJwtAuthzGrant } from 'id-assert-authz-grant-client';
import * as jose from 'jose';
import { CustomOIDCProviderError, OIDCProviderError } from 'oidc-provider/lib/helpers/errors.js';
import validatePresence from 'oidc-provider/lib/helpers/validate_presence.js';
import instance from 'oidc-provider/lib/helpers/weak_cache.js';
import { createClient } from 'redis';
import { getSubjectToken } from '../../utils/id-token-cache.js';

let redisClient = null;

const setInRedis = async ({ subjectToken, tokenType }) => {
  try {
    if (!redisClient) {
      const client = createClient({
        url: process.env.REDIS_SERVER,
      });
      client.on('error', (err) => console.log('Redis Client Error', err));

      redisClient = client;
    }

    await redisClient.connect();
    await redisClient.set('jag_subject_token_type', tokenType);
    await redisClient.set('jag_subject_token', subjectToken);

    await redisClient.disconnect();
  } catch (e) {
    console.log('Redis set error:', e);
  }
};
// eslint-disable-next-line import/prefer-default-export

export async function authorizationGrantTokenExchange(ctx, configuration) {
  validatePresence(ctx, 'resource', 'subject_token', 'subject_token_type');
  const { resource, subject_token, subject_token_type, scope } = ctx.oidc.params;

  // const jwks = configuration.jwks;
  const jwks = await jose.importJWK(instance(ctx.oidc.provider).jwksResponse.keys[0]);

  const { payload } = await jose.jwtVerify(subject_token, jwks, {
    issuer: process.env.AUTH_SERVER,
  });

  const customer = payload.sub.split(':')[0];
  const provider = configuration.providers[customer];

  if (!provider) {
    throw new CustomOIDCProviderError(
      'invalid_grant',
      'Subject of this JWT does not match a configured OIDC provider.'
    );
  }

  const { subjectToken, tokenType } = getSubjectToken(payload.sub, provider.client_id);

  await setInRedis({ subjectToken, tokenType });
  const { error, payload: jwtAuthGrant } = await requestIdJwtAuthzGrant({
    tokenUrl: provider.token_endpoint,
    resource,
    subjectToken,
    subjectTokenType: provider.use_saml_sso ? 'saml' : 'oidc', // This is hardcoded to what we use for Okta.
    scopes: scope, // Can be undefined, will default to empty string
    clientID: provider.client_id,
    clientSecret: provider.client_secret,
  });

  if (error) {
    if (error instanceof OAuthBadRequest) {
      throw new CustomOIDCProviderError(error.error, error.error_description, error.error_uri);
    }

    throw new OIDCProviderError(error.status, error.message);
  }

  if (jwtAuthGrant) {
    ctx.body = jwtAuthGrant;
  }
}
