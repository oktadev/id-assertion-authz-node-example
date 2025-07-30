import { OAuthGrantType } from 'id-assert-authz-grant-client';
import * as jose from 'jose';
import { CustomOIDCProviderError } from 'oidc-provider/lib/helpers/errors.js';
import validatePresence from 'oidc-provider/lib/helpers/validate_presence.js';
import instance from 'oidc-provider/lib/helpers/weak_cache.js';
import makeConfiguration from './server-configuration.js';
import { validateSignatureJWKs } from './utils/jwks.js';

export default async (_, provider) => {
  const parameters = ['assertion', 'scope'];

  const configuration = await makeConfiguration();

  async function jwtAuthorizationGrantHandler(ctx, next) {
    // TODO Float error to frontend with appropriate status and code

    // ctx.oidc.params holds the parsed parameters
    // ctx.oidc.client has the authenticated client
    console.log('Doing JWT Authorization Grant');

    const {
      features: { resourceIndicators },
    } = instance(ctx.oidc.provider).configuration();

    // Require the "assertion" parameter
    validatePresence(ctx, 'assertion');
    const { assertion } = ctx.oidc.params;

    // DANGER ZONE: JWT SIGNATURE IS NOT YET VERIFIED

    // Validate the typ in the header
    const header = jose.decodeProtectedHeader(assertion);

    if (header.typ !== 'oauth-id-jag+jwt') {
      throw new CustomOIDCProviderError(
        'invalid_grant',
        'invalid JWT type, expected typ: oauth-id-jag+jwt'
      );
    }

    const claims = jose.decodeJwt(assertion);
    console.log('JWT Authorization Grant claims:', claims);

    // `iss` should match one of the configured providers in `server-configuration.js`
    const providerDetails = Object.values(configuration.providers).find(
      (p) => p.issuer === claims.iss
    );

    if (!providerDetails) {
      throw new CustomOIDCProviderError(
        'invalid_grant',
        'Issuer of this JWT does not match a configured OIDC provider'
      );
    }

    // Claims issuer is confirmed allowed, so now validate the signature with the issuers public key
    try {
      await validateSignatureJWKs(claims.iss, assertion);
    } catch (e) {
      throw new CustomOIDCProviderError('invalid_signature', 'JWT signature is invalid');
    }
    // JWT SIGNATURE IS VERIFIED NOW

    // Validate iat, exp
    const now = Math.floor(Date.now() / 1000);
    if (claims.iat < now - 30) {
      throw new CustomOIDCProviderError(
        'invalid_grant',
        `JWT (iat=${claims.iat}) is not yet valid (now=${now}, now-30=${now - 30})`
      );
    }
    if (now >= claims.exp) {
      throw new CustomOIDCProviderError('invalid_grant', 'JWT has expired');
    }

    // Validate client_id - should match client authentication of this request
    if (claims.client_id !== ctx.oidc.authorization.clientId) {
      throw new CustomOIDCProviderError(
        'invalid_grant',
        'The authorized party (client_id) in this JWT does not match the client authentication of this request'
      );
    }

    // Validate the audience is this server's issuer URL
    if (claims.aud !== `${process.env.AUTH_SERVER}`) {
      throw new CustomOIDCProviderError(
        'invalid_grant',
        "The audience does not match this server's issuer URL"
      );
    }

    // Generate an access token for the requested user identified by `claims.sub`

    const { AccessToken } = ctx.oidc.provider;

    const at = new AccessToken({
      accountId: `${providerDetails.name}:${claims.sub}`,
      client: ctx.oidc.client,
      expiresWithSession: false,
      grantId: 'TODO',
    });

    const resource = resourceIndicators.defaultResource(
      ctx,
      ctx.oidc.client,
      process.env.APP_RESOURCE
    );
    const resourceServerInfo = await resourceIndicators.getResourceServerInfo(
      ctx,
      resource,
      ctx.oidc.client
    );

    // console.log(resourceServerInfo);
    at.resourceServer = new ctx.oidc.provider.ResourceServer(resource, resourceServerInfo);

    // Client-requested scopes are in ctx.oidc.params.scope
    // The JWT assertion says which scopes the IdP authorized (claims.scope)
    // The scope to issue is any client-requested scopes that are in the IdP scopes
    console.log('Client requested scopes', ctx.oidc.params.scope);

    const client_requested_scopes = ctx.oidc.params.scope ? ctx.oidc.params.scope.split(' ') : [];
    const idp_authorized_scopes = claims.scope ? claims.scope.split(' ') : '';
    console.log('IdP scopes', idp_authorized_scopes);

    at.scope = Array.from(
      new Set(client_requested_scopes.filter((value) => idp_authorized_scopes.includes(value)))
    ).join(' ');
    console.log('Issued scopes', at.scope);

    ctx.oidc.entity('AccessToken', at);
    const accessToken = await at.save();

    // TODO: issue refresh token too

    ctx.body = {
      access_token: accessToken,
      expires_in: at.expiration,
      scope: at.scope,
      token_type: at.tokenType,
    };

    await next();
  }

  provider.registerGrantType(OAuthGrantType.JWT_BEARER, jwtAuthorizationGrantHandler, parameters);
};
