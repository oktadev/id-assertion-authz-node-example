import passportSAML from '@node-saml/passport-saml';
import passportOIDC from 'passport-openidconnect';
import Account from './account.js';
import { cacheSubjectToken } from './id-token-cache.js';

const samlCertificate = process.env.CUSTOMER1_SAML_CERTIFICATE;
const samlEntryPoint = process.env.CUSTOMER1_SAML_ENTRY_POINT;
const samlIssuer = process.env.CUSTOMER1_SAML_ISSUER;
const SAML_CALLBACK_PATH = '/saml/callback/customer1';

const OpenIDConnectStrategy = passportOIDC.Strategy;
const SAMLStrategy = passportSAML.Strategy;

export function createSAMLStrategy() {
  if (!samlCertificate || !samlEntryPoint || !samlIssuer) {
    console.log('Missing at least one saml env variable');
    return;
  }

  return new SAMLStrategy(
    {
      path: SAML_CALLBACK_PATH,
      entryPoint: samlEntryPoint,
      issuer: samlIssuer,
      signatureAlgorithm: 'sha256',
      digestAlgorithm: 'sha256',
      idpCert: samlCertificate,
      callbackUrl: `${process.env.AUTH_SERVER}${SAML_CALLBACK_PATH}`,
      audience: `${process.env.AUTH_SERVER}${SAML_CALLBACK_PATH}`,
    },
    (profile, done) => done(null, profile),
    (profile, done) => done(null, profile)
  );
}

export function createOIDCStrategy(org) {
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
      console.log('Passport Verify OIDC', issuer);

      const account = await Account.upsertAccount(profile.id, profile, org.name);

      // update the id to be globally unique
      // eslint-disable-next-line no-param-reassign
      profile.id = account.accountId;

      // This passport strategy is used for Wiki0 OAuth,
      // so do not overwrite the SAML token in the cache if using SML
      if (!org.use_saml_sso) {
        cacheSubjectToken(profile.id, org.client_id, id_token, 'oidc');
      }

      return cb(null, profile);
    }
  );
}

export function createPassportStrategy(org) {
  if (org && org.use_saml_sso) {
    return createSAMLStrategy();
  }

  return createOIDCStrategy(org);
}
