const cache = {};

/**
 *
 * Caches the ID Assertion after SSO for token exchange
 *
 * NOTE: In production, the cache lookup key should be the authorization_code
 *
 */

function makeCacheKey(subject, client_id) {
  return [subject, client_id].join('|');
}

export function cacheSubjectToken(subject, client_id, token, type) {
  cache[makeCacheKey(subject, client_id)] = { subjectToken: token, type };
}

export function getSubjectToken(subject, client_id) {
  return cache[makeCacheKey(subject, client_id)] || { subjectToken: undefined, type: undefined };
}
