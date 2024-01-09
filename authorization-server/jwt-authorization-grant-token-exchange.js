import * as jose from 'jose';
import { CustomOIDCProviderError, OIDCProviderError } from 'oidc-provider/lib/helpers/errors.js';
import validatePresence from 'oidc-provider/lib/helpers/validate_presence.js';
import instance from 'oidc-provider/lib/helpers/weak_cache.js';
import { OAuthBadRequest, getJwtAuthGrant } from 'request-jwt-auth-grant';
import { getIdToken } from './utils/id-token-cache.js';
// Final name TBD
export const authorizationGrantTokenExchangeType =
  'urn:ietf:params:oauth:token-type:jwt-authorization-grant';
export const idaagTokenExchangeType = 'urn:ietf:params:oauth:token-type:id-jag';

export async function authorizationGrantTokenExchange(ctx, configuration) {
  validatePresence(ctx, 'resource', 'subject_token', 'subject_token_type');

  const { resource, subject_token, subject_token_type, scope } = ctx.oidc.params;

  // subject_token is idToken -> get back the saved idp id Token
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

  // Lookup by payload.sub and get the last idToken saved
  const savedIdToken = getIdToken(payload.sub);

  const { error, payload: jwtAuthGrant } = await getJwtAuthGrant({
    tokenUrl: provider.token_endpoint,
    resource,
    subjectToken: savedIdToken,
    // This is hardcoded to what we use for Okta.
    subjectTokenType: 'oidc',
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
