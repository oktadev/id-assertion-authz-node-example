import * as jose from 'jose';
import { urlencoded } from 'express'; // eslint-disable-line import/no-unresolved
import { getSubjectToken } from '../utils/id-token-cache.js';
import makeConfiguration from '../server-configuration.js';
import { validateSignatureJWKs } from '../utils/jwks.js';

const body = urlencoded({ extended: false });

// Route exposed for demo purposes only so we can debug the tokens in the console
export default async (app, provider) => {
  const configuration = await makeConfiguration();

  function setNoCache(req, res, next) {
    res.set('cache-control', 'no-store');
    next();
  }

  app.get('/debug/tokens', setNoCache, body, async (req, res) => {
    let assertion = '';
    let tokenType = 'oidc';

    try {
      // Send the ID Token from the OIDC flow on the web app
      // and return the cached ID token from the SSO exchange for a JAG
      const idToken = req.header('Wiki0-Debug-ID');

      // console.log({ idToken });

      if (!idToken) {
        res.json({
          assertion,
          type: tokenType,
        });
        return;
      }

      const claims = jose.decodeJwt(idToken);

      const providerDetails = configuration.providers[claims.app_org];

      if (!providerDetails) {
        res.json({
          assertion,
          type: tokenType,
        });
        return;
      }

      await validateSignatureJWKs(claims.iss, idToken);

      let cacheKey = claims.sub;
      if (providerDetails.use_saml_sso) {
        cacheKey = `${claims.app_org}:${payload.preferred_username}`;
      }

      const { subjectToken, type } = getSubjectToken(cacheKey, providerDetails.client_id);

      if (type) {
        tokenType = type;
      }

      if (subjectToken) {
        assertion = subjectToken;
      }
    } finally {
      res.json({
        assertion,
        type: tokenType,
      });
    }
  });
};
