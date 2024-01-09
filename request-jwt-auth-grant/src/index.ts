import qs from 'qs';
import { InvalidArgumentError } from './exceptions';
import HttpResponse from './http-response';
import JwtAuthGrantResponse from './jwt-auth-grant-response';
import OAuthBadRequest from './oauth-bad-request';
import {
  JwtAuthorizationGrant,
  OAuthClientAssertionType,
  OAuthError,
  OAuthGrantType,
  OAuthTokenType,
} from './oauth.types';

export * from './exceptions';
export * from './oauth.types';

export { default as HttpResponse } from './http-response';
export { default as JwtAuthGrantResponse } from './jwt-auth-grant-response';
export { default as OAuthBadRequest } from './oauth-bad-request';

export type GetJwtAuthGrantBaseOptions = {
  tokenUrl: string;
  resource: string;
  subjectTokenType: SubjectTokenType;
  subjectToken: string;
  scopes?: string | Set<string> | string[];
};

export type GetJwtAuthGrantClientSecretOption = {
  clientID: string;
  clientSecret?: string;
};

export type GetJwtAuthGrantClientAssertionOption = {
  clientAssertion: string;
};

export type SubjectTokenType = 'oidc' | 'saml';

export type GetJwtAuthGrantResult =
  | {
      payload: JwtAuthorizationGrant;
    }
  | {
      error: OAuthError | HttpResponse;
    };

type RequestFields = {
  grant_type: OAuthGrantType.TOKEN_EXCHANGE;
  requested_token_type: OAuthTokenType.JWT_ID_JAG | OAuthTokenType.JWT_AUTHORIZATION_GRANT;
  resource: string;
  scope: string;
  subject_token: string;
  subject_token_type: OAuthTokenType;
};

type ClientIdFields = {
  client_id: string;
  client_secret?: string;
};

type ClientAssertionFields = {
  client_assertion_type: OAuthClientAssertionType;
  client_assertion: string;
};

export const getJwtAuthGrant = async (
  opts: GetJwtAuthGrantBaseOptions &
    (GetJwtAuthGrantClientSecretOption | GetJwtAuthGrantClientAssertionOption)
): Promise<GetJwtAuthGrantResult> => {
  const { resource, subjectToken, subjectTokenType, scopes, tokenUrl } = opts;

  if (!tokenUrl || typeof tokenUrl !== 'string') {
    throw new InvalidArgumentError('opts.tokenUrl', 'A valid url is required.');
  }

  if (!resource || typeof resource !== 'string') {
    throw new InvalidArgumentError('opts.resource', 'A valid string is required.');
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

  let scope: string;

  if (scopes) {
    if (Array.isArray(scopes)) {
      scope = scopes.join(' ');
    } else if (scopes instanceof Set) {
      scope = Array.from(scopes).join(' ');
    } else if (typeof scopes === 'string') {
      scope = scopes;
    } else {
      throw new InvalidArgumentError(
        'scopes',
        'Expected a valid string, array of strings, or Set of strings.'
      );
    }
  } else {
    scope = '';
  }

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

  return {
    payload: new JwtAuthGrantResponse((await response.json()) as Record<string, any>),
  };
};
