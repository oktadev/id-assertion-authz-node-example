import { Router } from 'express';
import passport from 'passport';
import OpenIDConnectStrategy, { Profile, VerifyCallback } from 'passport-openidconnect';
// eslint-disable-next-line import/no-relative-packages
import prisma from '../prisma';

// Most of the code below comes from https://developer.okta.com/blog/2023/07/28/oidc_workshop
export const TODO_COOKIE_NAME = 'todo.sid';
const controller = Router();

async function orgFromDomain(domain: string) {
  const org = await prisma.organization.findFirst({
    where: {
      domain: domain,
    },
  });
  return org;
}

// TODO: Move this to somewhere that is not in the controller
async function orgFromAuthServerOrgKey(key: string) {
  const org = await prisma.organization.findFirst({
    where: {
      auth_server_key: key,
    },
  });
  return org;
}

function getDomainFromEmail(email: string | undefined | null) {
  if (!email) {
    return null;
  }
  const [, domain] = email.split('@');
  return domain;
}

const verify = async (
  issuer: string,
  profile: Profile,
  context: object,
  idToken: object | string,
  done: VerifyCallback
) => {
  const externalId = profile.id;
  const authServerOrgKey = externalId.split(':')[0];
  const userId = externalId.split(':')[1];

  if (!authServerOrgKey || !userId) {
    return done(
      new Error(`Could not parse profile.id for org and user id: ${JSON.stringify(profile)}`)
    );
  }
  const org = await orgFromAuthServerOrgKey(authServerOrgKey);
  if (!org) {
    return done(
      new Error(`No org found for key=${authServerOrgKey}, profile: ${JSON.stringify(profile)}`)
    );
  }

  // Passport.js runs this verify function after successfully completing
  // the OIDC flow, and gives this app a chance to do something with
  // the response from the OIDC server, like create users on the fly.

  let user = await prisma.user.findFirst({
    where: {
      orgId: org.id,
      externalId: profile.id,
    },
  });

  if (user) {
    return done(null, user);
  }

  // Ensure the profile response has the correct fields present to update or create a new user
  if (!profile.displayName || !profile.emails) {
    return done(new Error(`Invalid profile response: ${JSON.stringify(profile)}`));
  }

  try {
    user = await prisma.user.findFirst({
      where: {
        orgId: org.id,
        email: profile.emails[0].value,
      },
    });
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { externalId: profile.id },
      });
    }

    if (!user) {
      user = await prisma.user.create({
        data: {
          org: { connect: { id: org.id } },
          externalId: profile.id,
          email: profile.emails![0].value,
          name: profile.displayName,
        },
      });
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      return done(err);
    }
    return done(new Error(`Error in OIDCStrategy with ${err}`));
  }

  return done(null, user);
};

function createStrategy(username: string) {
  return new OpenIDConnectStrategy(
    {
      issuer: process.env.AUTH_SERVER!,
      authorizationURL: `${process.env.AUTH_SERVER}/auth`,
      tokenURL: `${process.env.AUTH_SERVER}/token`,
      userInfoURL: `${process.env.AUTH_SERVER}/me`,
      clientID: process.env.CLIENT1_CLIENT_ID!,
      clientSecret: process.env.CLIENT1_CLIENT_SECRET!,
      scope: 'profile email openid read write',
      callbackURL: `${process.env.TODO_SERVER}/api/openid/callback/`,
      loginHint: username,
    },
    verify
  );
}

controller.post('/signout', async (req, res, next) => {
  req.logout((err) => {
    if (err) {
      next(err);
    }
  });

  req.session.destroy((err) => {
    if (!err) {
      res.status(200).clearCookie(TODO_COOKIE_NAME, { path: '/' }).json({ status: 'Success' });
    } else {
      next(err);
    }
  });
});

/**
 * Frontend UI can call this to see if the domain matches an Organization in the database.
 */
controller.post('/check', async (req, res) => {
  const { username } = req.body;

  const domain = getDomainFromEmail(username);
  if (domain) {
    let org = await prisma.organization.findFirst({
      where: {
        domain: domain,
      },
    });
    if (!org) {
      org = await prisma.organization.findFirst({
        where: {
          User: {
            some: {
              email: username,
            },
          },
        },
      });
    }
    if (org) {
      res.json({ orgId: org.id });
      return;
    }
  }

  res.json({ orgId: null });
});

/**
 * The frontend then redirects here to have the backend start the OIDC flow.
 * (You should probably use random IDs, not auto-increment integers
 * to avoid revealing how many enterprise customers you have.)
 */
controller.get('/start/:username', async (req, res, next) => {
  const domain = getDomainFromEmail(req.params.username);
  if (!domain) {
    res.sendStatus(404);
    return;
  }

  const org = await orgFromDomain(domain);
  if (!org) {
    res.sendStatus(404);
    return;
  }

  const strategy = createStrategy(req.params.username);
  if (!strategy) {
    res.sendStatus(404);
    return;
  }

  passport.authenticate(strategy)(req, res, next);
});

/**
 * Callback called from the Oauth server on succesful authentication.
 */
controller.get('/callback/', async (req, res, next) => {
  passport.authenticate(createStrategy(''), {
    successRedirect: '/',
    failureRedirect: '/',
    failureMessage: true,
  })(req, res, next);
});

export default controller;
