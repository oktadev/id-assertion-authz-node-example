import qs from 'qs';
import { InvalidArgumentError, InvalidPayloadError } from './exceptions';
import HttpResponse from './http-response';
import OAuthBadRequest from './oauth-bad-request';
import OauthTokenExchangeResponse from './oauth-token-exchange-response';
import {
  ClientAssertionFields,
  ClientIdFields,
  OAuthClientAssertionType,
  OAuthGrantType,
  OAuthTokenType,
} from './oauth.types';
import { transformScopes } from './oauth.utilities';
import { ClientAssertionOption, ClientIdOption, ExchangeTokenResult } from './types';

export type GetJwtAuthGrantBaseOptions = {
  tokenUrl: string;
  resource?: string;
  audience: string;
  subjectTokenType: SubjectTokenType;
  subjectToken: string;
  scopes?: string | Set<string> | string[];
};

export type SubjectTokenType = 'oidc' | 'saml';

type RequestFields = {
  grant_type: OAuthGrantType.TOKEN_EXCHANGE;
  requested_token_type: OAuthTokenType.JWT_ID_JAG;
  resource?: string;
  audience: string;
  scope: string;
  subject_token: string;
  subject_token_type: OAuthTokenType;
};

export const requestIdJwtAuthzGrant = async (
  opts: GetJwtAuthGrantBaseOptions & (ClientIdOption | ClientAssertionOption)
): Promise<ExchangeTokenResult> => {
  const { resource, subjectToken, subjectTokenType, audience, scopes, tokenUrl } = opts;

  if (!tokenUrl || typeof tokenUrl !== 'string') {
    throw new InvalidArgumentError('opts.tokenUrl', 'A valid url is required.');
  }

  if (!audience || typeof audience !== 'string') {
    throw new InvalidArgumentError('opts.audience', 'A valid string is required.');
  }

  if (!subjectToken || typeof subjectToken !== 'string') {
    throw new InvalidArgumentError('opts.subjectToken');
  }

  let subjectTokenUrn: OAuthTokenType;

  switch (subjectTokenType) {
    case 'saml':
      subjectTokenUrn = OAuthTokenType.SAML2;
      break;
    case 'oidc':
      subjectTokenUrn = OAuthTokenType.ID_TOKEN;
      break;
    default:
      throw new InvalidArgumentError(
        'opts.subjectTokenType',
        'A valid SubjectTokenType constant is required.'
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
    grant_type: OAuthGrantType.TOKEN_EXCHANGE,
    requested_token_type: OAuthTokenType.JWT_ID_JAG,
    audience,
    resource,
    scope,
    subject_token: subjectToken,
    subject_token_type: subjectTokenUrn,
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

  const payload = new OauthTokenExchangeResponse((await response.json()) as Record<string, any>);

  if (payload.issued_token_type !== OAuthTokenType.JWT_ID_JAG) {
    throw new InvalidPayloadError(
      `The field 'issued_token_type' must have the value '${OAuthTokenType.JWT_ID_JAG}' per the Identity Assertion Authorization Grant Draft Section 5.2.`
    );
  }

  if (payload.token_type.toLowerCase() !== 'n_a') {
    throw new InvalidPayloadError(
      `The field 'token_type' must have the value 'n_a' per the Identity Assertion Authorization Grant Draft Section 5.2.`
    );
  }

  return { payload };
};
