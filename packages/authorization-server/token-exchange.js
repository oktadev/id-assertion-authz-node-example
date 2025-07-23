import { OAuthTokenType } from 'id-assert-authz-grant-client';
import { CustomOIDCProviderError } from 'oidc-provider/lib/helpers/errors.js';
import { authorizationGrantTokenExchange } from './jwt-authorization-grant-token-exchange.js';
import makeConfiguration from './server-configuration.js';

export default async (_, provider, redisclient) => {
  const configuration = await makeConfiguration();

  const grantType = 'urn:ietf:params:oauth:grant-type:token-exchange';

  const parameters = [
    'requested_token_type',
    'resource',
    'scope',
    'subject_token',
    'subject_token_type',
    'audience',
    // Other parameters we aren't using
    // 'actor_token',
    // 'actor_token_type'
  ];

  async function tokenExchangeHandler(ctx, next) {
    const { requested_token_type } = ctx.oidc.params;

    if (requested_token_type === OAuthTokenType.JWT_ID_JAG) {
      await authorizationGrantTokenExchange(ctx, configuration, redisclient);
    } else {
      throw new CustomOIDCProviderError(
        'invalid_grant',
        `request_token_type '${requested_token_type}' is an unknown or unsupported token type.`
      );
    }

    next();
  }

  provider.registerGrantType(grantType, tokenExchangeHandler, parameters);
};
