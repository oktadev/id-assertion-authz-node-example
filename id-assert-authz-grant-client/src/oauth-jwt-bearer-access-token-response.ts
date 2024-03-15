import { InvalidPayloadError } from './exceptions';
import { OAuthAccessTokenResponseType } from './oauth.types';

const invalidRFC6749PayloadError = (
  field: string,
  requirement: string,
  payload?: Record<string, any>
) =>
  new InvalidPayloadError(
    `The field '${field}' ${requirement} per RFC8693. See https://datatracker.ietf.org/doc/html/rfc6749#section-4.2.2.`,
    { payload }
  );

const invalidRFC7523PayloadError = (
  field: string,
  requirement: string,
  payload?: Record<string, any>
) =>
  new InvalidPayloadError(
    `The field '${field}' ${requirement} per RFC7523. See https://datatracker.ietf.org/doc/html/rfc7523#section-2.1.`,
    { payload }
  );

export default class OauthJwtBearerAccessTokenResponse implements OAuthAccessTokenResponseType {
  access_token: string;

  token_type: string;

  scope?: string;

  expires_in?: number;

  refresh_token?: string;

  constructor(payload: Record<string, any>) {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { access_token, token_type, scope, expires_in, refresh_token } =
      payload as OAuthAccessTokenResponseType;

    if (!access_token || typeof access_token !== 'string') {
      throw invalidRFC6749PayloadError(
        'access_token',
        'must be present and a valid value',
        payload
      );
    }

    this.access_token = access_token;

    if (!token_type || typeof token_type !== 'string' || token_type.toLowerCase() !== 'bearer') {
      throw invalidRFC7523PayloadError('token_type', "must have the value 'bearer'", payload);
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
