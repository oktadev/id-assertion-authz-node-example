import { InvalidPayloadError } from './exceptions';
import { OAuthError, OAuthErrorType, OAuthErrorTypes } from './oauth.types';

const invalidOAuthErrorResponse = (
  field: string,
  requirement: string,
  payload?: Record<string, any>
) =>
  new InvalidPayloadError(
    `The field '${field}' ${requirement} per RFC6749. See https://datatracker.ietf.org/doc/html/rfc6749#section-5.2.`,
    { payload }
  );

export default class OAuthBadRequest implements OAuthError {
  error: OAuthErrorType;

  error_description?: string;

  error_uri?: string;

  constructor(payload: Record<string, any>) {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { error, error_description, error_uri } = payload as OAuthError;

    if (!error || !OAuthErrorTypes.includes(error)) {
      throw invalidOAuthErrorResponse('error', 'must be present and a valid value', payload);
    }

    this.error = error;

    if (error_description) {
      if (typeof error_description !== 'string') {
        throw invalidOAuthErrorResponse('error_description', 'must be a valid string', payload);
      }

      this.error_description = error_description;
    }

    if (error_uri) {
      if (typeof error_uri !== 'string') {
        throw invalidOAuthErrorResponse('error_uri', 'must be a valid string', payload);
      }

      this.error_uri = error_uri;
    }
  }
}
