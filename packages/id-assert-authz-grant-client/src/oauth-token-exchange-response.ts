import { InvalidPayloadError } from './exceptions';
import { OAuthTokenExchangeResponseType, OAuthTokenType } from './oauth.types';

const invalidRFC8693PayloadError = (
  field: string,
  requirement: string,
  payload?: Record<string, any>
) =>
  new InvalidPayloadError(
    `The field '${field}' ${requirement} per RFC8693. See https://datatracker.ietf.org/doc/html/rfc8693#section-2.2.1.`,
    { payload }
  );

export default class OauthTokenExchangeResponse implements OAuthTokenExchangeResponseType {
  access_token: string;

  issued_token_type: OAuthTokenType;

  token_type: string;

  scope?: string;

  expires_in?: number;

  refresh_token?: string;

  constructor(payload: Record<string, any>) {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { access_token, issued_token_type, token_type, scope, expires_in, refresh_token } =
      payload as OAuthTokenExchangeResponseType;

    if (!access_token || typeof access_token !== 'string') {
      throw invalidRFC8693PayloadError(
        'access_token',
        'must be present and a valid value',
        payload
      );
    }

    this.access_token = access_token;

    if (!issued_token_type || typeof issued_token_type !== 'string') {
      throw invalidRFC8693PayloadError(
        'issued_token_type',
        'must be present and a valid value',
        payload
      );
    }

    this.issued_token_type = issued_token_type;

    if (!token_type || typeof token_type !== 'string') {
      throw invalidRFC8693PayloadError('token_type', 'must be present and a valid value', payload);
    }

    this.token_type = token_type;

    if (scope && typeof scope === 'string') {
      this.scope = scope;
    }

    if (typeof expires_in === 'number' && expires_in > 0) {
      this.expires_in = expires_in;
    }

    if (refresh_token && typeof refresh_token === 'string') {
      this.refresh_token = refresh_token;
    }
  }
}
