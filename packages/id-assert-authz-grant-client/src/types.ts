import {
  OAuthAccessTokenResponseType,
  OAuthError,
  OAuthTokenExchangeResponseType,
} from './oauth.types';
import HttpResponse from './http-response';

export type ClientIdOption = {
  clientID: string;
  clientSecret?: string;
};

export type ClientAssertionOption = {
  clientAssertion: string;
};

export type ExchangeTokenResult =
  | {
      payload: OAuthTokenExchangeResponseType;
    }
  | {
      error: OAuthError | HttpResponse;
    };

export type AccessTokenResult =
  | {
      payload: OAuthAccessTokenResponseType;
    }
  | {
      error: OAuthError | HttpResponse;
    };
