import { CustomOIDCProviderError } from 'oidc-provider/lib/helpers/errors.js';
import {
  authorizationGrantTokenExchange,
  authorizationGrantTokenExchangeType,
  idaagTokenExchangeType,
} from './jwt-authorization-grant-token-exchange.js';
import makeConfiguration from './server-configuration.js';

export default async (_, provider) => {
  const configuration = await makeConfiguration();

  const grantType = 'urn:ietf:params:oauth:grant-type:token-exchange';

  const parameters = [
    'requested_token_type',
    'resource',
    'scope',
    'subject_token',
    'subject_token_type',
    // Other parameters we aren't using
    // 'actor_token',
    // 'actor_token_type'
  ];

  async function tokenExchangeHandler(ctx, next) {
    const { requested_token_type } = ctx.oidc.params;

    if (
      requested_token_type === authorizationGrantTokenExchangeType ||
      requested_token_type === idaagTokenExchangeType
    ) {
      await authorizationGrantTokenExchange(ctx, configuration);
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
