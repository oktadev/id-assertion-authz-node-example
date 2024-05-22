import qs from 'qs';
import {
  ClientAssertionFields,
  ClientIdFields,
  OAuthClientAssertionType,
  OAuthGrantType,
} from './oauth.types';
import { transformScopes } from './oauth.utilities';
import { InvalidArgumentError } from './exceptions';
import OAuthBadRequest from './oauth-bad-request';
import HttpResponse from './http-response';
import { AccessTokenResult, ClientAssertionOption, ClientIdOption } from './types';
import OauthJwtBearerAccessTokenResponse from './oauth-jwt-bearer-access-token-response';

export type ExchangeJwtAuthGrantBaseOptions = {
  tokenUrl: string;
  authorizationGrant: string;
  scopes?: string | Set<string> | string[];
};

type RequestFields = {
  grant_type: OAuthGrantType.JWT_BEARER;
  assertion: string;
  scope: string;
};

export const exchangeIdJwtAuthzGrant = async (
  opts: ExchangeJwtAuthGrantBaseOptions & (ClientIdOption | ClientAssertionOption)
): Promise<AccessTokenResult> => {
  const { tokenUrl, authorizationGrant, scopes } = opts;

  if (!tokenUrl || typeof tokenUrl !== 'string') {
    throw new InvalidArgumentError('opts.tokenUrl', 'A valid url is required.');
  }

  if (!authorizationGrant || typeof authorizationGrant !== 'string') {
    throw new InvalidArgumentError(
      'opts.authorizationGrant',
      'A valid authorization grant is required.'
    );
  }

  const scope = transformScopes(scopes);

  let clientAssertionData: ClientIdFields | ClientAssertionFields;

  if ('clientID' in opts) {
    clientAssertionData = {
      client_id: opts.clientID,
      ...(opts.clientSecret ? { client_secret: opts.clientSecret } : null),
    };
  } else if ('clientAssertion' in opts) {
    clientAssertionData = {
      client_assertion_type: OAuthClientAssertionType.JWT_BEARER,
      client_assertion: opts.clientAssertion,
    };
  } else {
    throw new InvalidArgumentError(
      'opts.clientAssertion',
      'Expected a valid client assertion jwt or client id and secret.'
    );
  }

  const requestData: RequestFields & (ClientIdFields | ClientAssertionFields) = {
    grant_type: OAuthGrantType.JWT_BEARER,
    assertion: authorizationGrant,
    scope,
    ...clientAssertionData,
  };

  const body = qs.stringify(requestData);

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  const resStatus = response.status;

  if (resStatus === 400) {
    return {
      error: new OAuthBadRequest((await response.json()) as Record<string, any>),
    };
  }

  if (resStatus > 200 && resStatus < 600) {
    return {
      error: new HttpResponse(
        response.url,
        response.status,
        response.statusText,
        await response.text()
      ),
    };
  }

  const payload = new OauthJwtBearerAccessTokenResponse(
    (await response.json()) as Record<string, any>
  );

  return { payload };
};
