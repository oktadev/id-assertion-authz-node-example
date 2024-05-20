import { urlencoded } from 'express'; // eslint-disable-line import/no-unresolved
import passport from 'passport';
import { buildErrorMessage } from 'vite';
import makeConfiguration from '../server-configuration.js';
import Account from '../utils/account.js';
import { cacheSubjectToken } from '../utils/id-token-cache.js';
import { createSAMLStrategy } from '../utils/passport-strategy.js';

const body = urlencoded({ extended: false });

export default async (app) => {
  // TODO: The OIDC resource mounts this route and fails
  if (!process.env.CUSTOMER1_SAML_ISSUER) {
    return;
  }

  const configuration = await makeConfiguration();

  function setNoCache(req, res, next) {
    res.set('cache-control', 'no-store');
    next();
  }

  app.post(
    '/saml/callback/:key',
    setNoCache,
    body,
    (req, res, next) => {
      passport.authenticate(createSAMLStrategy(req.params.key), {
        failureRedirect: '/',
        failureFlash: true,
      })(req, res, next);
    },
    async (req, res) => {
      console.log('Passport Verify SAML callback');

      const sso_provider = configuration.providers[req.params.key];

      if (!sso_provider) {
        buildErrorMessage('invalid_request', 'Unknown provider in SAML login');
        return;
      }
      // Use the userId SAML attribute, which is the Okta user ID
      const account = await Account.upsertAccount(req.user.userId, req.user, sso_provider.name);

      // eslint-disable-next-line no-param-reassign
      req.user.id = account.accountId;

      const assertionXmlString = req.user.getAssertionXml().toString();
      const assertion = Buffer.from(assertionXmlString).toString('base64');
      cacheSubjectToken(req.user.id, sso_provider.client_id, assertion, 'saml');

      // Continue the OIDC flow for the web app
      res.redirect(`/openid/callback/${sso_provider.name}`);
    }
  );
};
