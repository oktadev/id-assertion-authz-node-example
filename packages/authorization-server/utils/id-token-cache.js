const cache = {};

/**
 *
 * Caches the ID Assertion after SSO for token exchange
 *
 * NOTE: In production, the cache lookup key should be the authorization_code
 *
 */

function makeCacheKey(subject, client_id) {
  return `${subject}|${client_id}`;
}

export function cacheSubjectToken(subject, client_id, subjectToken, tokenType) {
  cache[makeCacheKey(subject, client_id)] = { subjectToken, tokenType };
}

export function getSubjectToken(subject, client_id) {
  return (
    cache[makeCacheKey(subject, client_id)] || { subjectToken: undefined, tokenType: undefined }
  );
}
