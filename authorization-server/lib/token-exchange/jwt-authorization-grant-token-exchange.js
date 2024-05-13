import { OAuthBadRequest, requestIdJwtAuthzGrant } from 'id-assert-authz-grant-client';
import * as jose from 'jose';
import { CustomOIDCProviderError, OIDCProviderError } from 'oidc-provider/lib/helpers/errors.js';
import validatePresence from 'oidc-provider/lib/helpers/validate_presence.js';
import instance from 'oidc-provider/lib/helpers/weak_cache.js';
import { getSubjectToken } from '../../utils/id-token-cache.js';
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

  // This is hardcoded to what we use for Okta.
  let subjectTokenType = 'oidc';
  let key = payload.sub;

  // TODO - SAML nameID comes in as the username in the jwt token
  if (provider.use_saml_sso) {
    key = `${payload.app_org}:${payload.preferred_username}`;
    subjectTokenType = 'saml';
  }

  const { subjectToken } = getSubjectToken(key, provider.client_id);

  const { error, payload: jwtAuthGrant } = await requestIdJwtAuthzGrant({
    tokenUrl: provider.token_endpoint,
    resource,
    subjectToken,
    subjectTokenType,
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