// This code is based on the node-oidc-provider example
// https://github.com/panva/node-oidc-provider/blob/73baae15001a30b8c29c3c35ea2b821a7fb3eafd/example/express.js

import { urlencoded } from 'express'; // eslint-disable-line import/no-unresolved
import isEmpty from 'lodash/isEmpty.js';
import * as querystring from 'node:querystring';
import { inspect } from 'node:util';
import { errors } from 'oidc-provider';
import passport from 'passport';
import passportOIDC from 'passport-openidconnect';
import { buildErrorMessage } from 'vite';
import makeConfiguration from './server-configuration.js';
import Account from './utils/account.js';
import { cache_id_token } from './utils/id-token-cache.js';

const OpenIDConnectStrategy = passportOIDC.Strategy;

const body = urlencoded({ extended: false });

const keys = new Set();
const debug = (obj) =>
  querystring.stringify(
    Object.entries(obj).reduce((acc, [key, value]) => {
      keys.add(key);
      if (isEmpty(value)) return acc;
      acc[key] = inspect(value, { depth: null });
      return acc;
    }, {}),
    '<br/>',
    ': ',
    {
      encodeURIComponent(value) {
        return keys.has(value) ? `<strong>${value}</strong>` : value;
      },
    }
  );

const { SessionNotFound } = errors;

export default async (app, provider) => {
  const configuration = await makeConfiguration();

  // Build an OAuth error response and redirect back to the client
  function redirectWithError(req, res, error, error_description) {
    const result = { error, error_description };
    provider.interactionFinished(req, res, result, { mergeWithLastSubmission: false });
  }

  app.use((err, req, res, next) => {
    if (err instanceof SessionNotFound) {
      // handle interaction expired / session not found error
    }
    next(err);
  });

  app.use((req, res, next) => {
    const orig = res.render;
    // you'll probably want to use a full blown render engine capable of layouts
    res.render = (view, locals) => {
      app.render(view, locals, (err, html) => {
        if (err) throw err;
        orig.call(res, '_layout', {
          ...locals,
          body: html,
        });
      });
    };
    next();
  });

  function setNoCache(req, res, next) {
    res.set('cache-control', 'no-store');
    next();
  }

  function createPassportStrategy(org) {
    return new OpenIDConnectStrategy(
      {
        issuer: org.issuer,
        authorizationURL: org.authorization_endpoint,
        tokenURL: org.token_endpoint,
        userInfoURL: org.userinfo_endpoint,
        clientID: org.client_id,
        clientSecret: org.client_secret,
        scope: 'profile email',
        callbackURL: `${process.env.AUTH_SERVER}/openid/callback/${org.name}`,
        pkce: org.pkce,
      },
      async (issuer, profile, context, id_token, cb) => {
        // Passport.js runs this verify function after successfully completing
        // the OIDC flow, and gives this app a chance to do something with
        // the response from the OIDC server, like create users on the fly.
        console.log('Passport Verify', issuer, profile);

        const account = await Account.upsertAccount(profile.id, profile, org.name);

        // update the id to be globally unique
        // eslint-disable-next-line no-param-reassign
        profile.id = account.accountId;

        cache_id_token(profile.id, id_token);

        return cb(null, profile);
      }
    );
  }

  // The user is redirected here after the OIDC server receives a request from a client.
  // Look up the configured SSO provider given the email domain from `login_hint` and redirect there.
  app.get('/interaction/:uid', setNoCache, async (req, res, next) => {
    try {
      const { uid, params } = await provider.interactionDetails(req, res);

      await provider.Client.find(params.client_id);

      console.log('Starting OAuth flow with ', params);

      if (!params.login_hint) {
        redirectWithError(req, res, 'invalid_request', 'Missing login_hint parameter.');
        return;
      }

      // Get email domain from login_hint
      const match = params.login_hint.match(/.+@(.+)/);
      if (!match) {
        redirectWithError(
          req,
          res,
          'invalid_request',
          'Invalid login_hint. Must be an email address.'
        );
        return;
      }
      const email_domain = match[1];

      // Find email domain in config
      const providerDetails = Object.values(configuration.providers).find((p) =>
        p.email_domains.includes(email_domain)
      );

      if (!providerDetails) {
        redirectWithError(req, res, 'invalid_request', 'No SSO provider for given login_hint');
        return;
      }

      // Start an OIDC flow to the provider for this email domain
      req.session.interaction_uid = uid;
      const strategy = createPassportStrategy(providerDetails);
      passport.authenticate(strategy)(req, res, next);
    } catch (err) {
      next(err);
    }
  });

  // Use this after successfully getting back info from the IdP to redirect back to the app
  app.get(
    '/openid/callback/:key',
    setNoCache,
    body,
    async (req, res, next) => {
      try {
        const sso_provider = configuration.providers[req.params.key];

        if (!sso_provider) {
          buildErrorMessage('invalid_request', 'Unknown provider in redirect');
          return;
        }

        const strategy = createPassportStrategy(sso_provider, req.params.key);

        res.locals.uid = req.session.interaction_uid;

        // Finish passport authentication
        passport.authenticate(strategy, { keepSessionInfo: true })(req, res, next);
      } catch (err) {
        next(err);
      }
    },
    async (req, res, next) => {
      // Passport sets req.user as the return value of the verify function above
      try {
        const interactionDetails = await provider.interactionDetails(req, res);
        const {
          prompt: { details },
          params,
        } = interactionDetails;

        // If interactionDetails contains an existing grantId, update that
        let { grantId } = interactionDetails;
        let grant;
        if (grantId) {
          grant = await provider.Grant.find(grantId);
        } else {
          grant = new provider.Grant({
            accountId: req.user.id,
            clientId: params.client_id,
          });
          // Add the OIDC scopes to the grant. we'll probably want to make this dynamic based on whether the client requested "profile" and "email" though
          grant.addOIDCScope('openid profile email');
        }

        if (details.missingResourceScopes) {
          console.log('Adding Resource scopes', details.missingResourceScopes);
          for (const [indicator, scopes] of Object.entries(details.missingResourceScopes)) {
            grant.addResourceScope(indicator, scopes.join(' '));
          }
        }
        // TODO: If the client requests additional claims, missingOIDCClaims will be set, and we need to either add the scopes or return an error
        // if (details.missingOIDCClaims) {
        //     console.log("Adding OIDC claims");
        //     grant.addOIDCClaims(details.missingOIDCClaims);
        // }

        // TODO: We need to look for other missing data and error out if we can't provide it. Otherwise this gets stuck in an infinite loop.

        grantId = await grant.save();

        const result = {
          login: {
            accountId: req.user.id,
            // acr: '', TODO
            // amr: '', TODO
            remember: false,
          },
          consent: { grantId },
        };

        await provider.interactionFinished(req, res, result, { mergeWithLastSubmission: false });
      } catch (err) {
        next(err);
      }
    }
  );
};
