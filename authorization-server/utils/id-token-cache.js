const cache = {};

export function cache_id_token(subject, id_token) {
  cache[subject] = id_token;
}

export function getIdToken(subject) {
  return cache[subject];
}
