export const enum OAuthGrantType {
  JWT_BEARER = 'urn:ietf:params:oauth:grant-type:jwt-bearer',
  TOKEN_EXCHANGE = 'urn:ietf:params:oauth:grant-type:token-exchange',
}

export const enum OAuthTokenType {
  ACCESS_TOKEN = 'urn:ietf:params:oauth:token-type:access_token',
  ID_TOKEN = 'urn:ietf:params:oauth:token-type:id_token',
  JWT_ID_JAG = 'urn:ietf:params:oauth:token-type:id-jag',
  SAML2 = 'urn:ietf:params:oauth:token-type:saml2',
}

export const enum OAuthClientAssertionType {
  JWT_BEARER = 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
}

export const OAuthErrorTypes = [
  'invalid_request',
  'invalid_client',
  'invalid_grant',
  'unauthorized_client',
  'unsupported_grant_type',
  'invalid_scope',
] as const;

export type OAuthErrorType = (typeof OAuthErrorTypes)[number];

export type OAuthError = {
  error: OAuthErrorType;
  error_description?: string;
  error_uri?: string;
};

export type OAuthAccessTokenResponseType = {
  access_token: string;
  token_type: string;
  scope?: string;
  expires_in?: number;
  refresh_token?: string;
};

export type OAuthTokenExchangeResponseType = {
  access_token: string;
  issued_token_type: OAuthTokenType;
  token_type: string;
  scope?: string;
  expires_in?: number;
  refresh_token?: string;
};

export type ClientIdFields = {
  client_id: string;
  client_secret?: string;
};

export type ClientAssertionFields = {
  client_assertion_type: OAuthClientAssertionType;
  client_assertion: string;
};
