import { InvalidArgumentError } from './exceptions';

// eslint-disable-next-line import/prefer-default-export
export const transformScopes = (scopes?: string | Set<string> | string[] | null) => {
  if (scopes) {
    if (Array.isArray(scopes)) {
      return scopes.join(' ');
    }

    if (scopes instanceof Set) {
      return Array.from(scopes).join(' ');
    }

    if (typeof scopes === 'string') {
      return scopes;
    }

    throw new InvalidArgumentError(
      'scopes',
      'Expected a valid string, array of strings, or Set of strings.'
    );
  }

  return '';
};
