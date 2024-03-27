import * as jose from 'jose';

export default async () => {
  const { privateKey } = await jose.generateKeyPair('RS256');
  const privateJwk = await jose.exportJWK(privateKey);
  return [privateJwk];
};

// TODO: memoize or cache the jwks_uri
export const validateSignatureJWKs = async (issuer, token) => {
  const issuerConfigResp = await fetch(`${issuer}/.well-known/openid-configuration`);
  const jwksJson = await issuerConfigResp.json();
  const JWKS = jose.createRemoteJWKSet(new URL(jwksJson.jwks_uri));

  return jose.jwtVerify(token, JWKS);
};
