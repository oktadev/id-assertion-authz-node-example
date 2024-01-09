import { InvalidPayloadError } from './exceptions';
import { JwtAuthorizationGrant, OAuthTokenType } from './oauth.types';

const invalidRFC8693PayloadError = (
  field: string,
  requirement: string,
  payload?: Record<string, any>
) =>
  new InvalidPayloadError(
    `The field '${field}' ${requirement} per RFC8693. See https://datatracker.ietf.org/doc/html/rfc8693#section-2.2.1.`,
    { payload }
  );

export default class JwtAuthGrantResponse implements JwtAuthorizationGrant {
  access_token: string;

  issued_token_type: OAuthTokenType.JWT_AUTHORIZATION_GRANT | OAuthTokenType.JWT_ID_JAG;

  token_type: OAuthTokenType.N_A;

  scope?: string;

  expires_in?: number;

  constructor(payload: Record<string, any>) {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { access_token, issued_token_type, token_type, scope, expires_in } =
      payload as JwtAuthorizationGrant;

    if (!access_token || typeof access_token !== 'string') {
      throw invalidRFC8693PayloadError(
        'access_token',
        'must be present and a valid value',
        payload
      );
    }

    this.access_token = access_token;

    if (
      issued_token_type !== OAuthTokenType.JWT_AUTHORIZATION_GRANT &&
      issued_token_type !== OAuthTokenType.JWT_ID_JAG
    ) {
      throw invalidRFC8693PayloadError(
        'issued_token_type',
        `must be present and have the value '${OAuthTokenType.JWT_AUTHORIZATION_GRANT}'`,
        payload
      );
    }

    this.issued_token_type = issued_token_type;

    if (token_type !== OAuthTokenType.N_A) {
      throw invalidRFC8693PayloadError(
        'token_type',
        `must be present and have the value '${OAuthTokenType.N_A}'`,
        payload
      );
    }

    this.token_type = token_type;

    if (scope) {
      if (typeof scope !== 'string') {
        throw invalidRFC8693PayloadError('scope', 'must be a valid string', payload);
      }

      this.scope = scope;
    }

    if (expires_in) {
      if (typeof expires_in !== 'number' || expires_in < 0) {
        throw invalidRFC8693PayloadError('expires_in', 'must be a valid positive number', payload);
      }

      this.expires_in = expires_in;
    }
  }
}
