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
    let type = 'oidc';

    try {
      // Send the ID Token from the OIDC flow on the web app
      // and return the cached ID token from the SSO exchange for a JAG
      const idToken = req.header('Wiki0-Debug-ID');

      // console.log({ idToken });

      if (!idToken) {
        res.json({
          assertion,
          type,
        });
        return;
      }

      const claims = jose.decodeJwt(idToken);

      const providerDetails = configuration.providers[claims.app_org];

      if (!providerDetails) {
        res.json({
          assertion,
          type,
        });
        return;
      }

      await validateSignatureJWKs(claims.iss, idToken);

      const key = claims.sub;
      // if (providerDetails.use_saml_sso) {
      //   key = `${claims.app_org}:${claims.preferred_username}`;
      // }

      const { subjectToken, tokenType } = getSubjectToken(key, providerDetails.client_id);

      if (tokenType) {
        type = tokenType;
      }

      if (subjectToken) {
        assertion = subjectToken;
      }

      res.json({
        assertion,
        type,
      });
    } catch (e) {
      console.log('Error getting tokens for debug console', e);
      res.json({
        assertion,
        type,
      });
    }
  });
};
