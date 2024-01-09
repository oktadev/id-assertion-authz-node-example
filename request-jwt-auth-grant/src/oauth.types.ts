export const enum OAuthGrantType {
  TOKEN_EXCHANGE = 'urn:ietf:params:oauth:grant-type:token-exchange',
}

export const enum OAuthTokenType {
  ID_TOKEN = 'urn:ietf:params:oauth:token-type:id_token',
  // Deprecated
  JWT_ID_JAG = 'urn:ietf:params:oauth:token-type:id-jag',
  JWT_AUTHORIZATION_GRANT = 'urn:ietf:params:oauth:token-type:jwt-authorization-grant',
  SAML2 = 'urn:ietf:params:oauth:token-type:saml2',

  // Not applicable
  N_A = 'N_A',
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

export type JwtAuthorizationGrant = {
  access_token: string;
  issued_token_type: OAuthTokenType.JWT_AUTHORIZATION_GRANT | OAuthTokenType.JWT_ID_JAG;
  token_type: OAuthTokenType.N_A;
  scope?: string;
  expires_in?: number;
};
