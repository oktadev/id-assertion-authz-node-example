import { User as PrismaUser } from '@prisma/client/wiki';
import RedisStore from 'connect-redis';
import dotenv from 'dotenv';
import express, { RequestHandler } from 'express';
import session from 'express-session';
import findConfig from 'find-config';
import passport from 'passport';
import { createClient } from 'redis';
import ViteExpress from 'vite-express';
import prisma from '../../prisma/client';
import article from './controllers/article';
import authtoken from './controllers/authtoken';
import oidc, { WIKI_COOKIE_NAME } from './controllers/oidc';
import user from './controllers/user';
import { JWT_STRATEGY_NAME, jwtStrategy } from './jwt/jwt-strategy';

// Find the nearest .env and load it into process.ENV
dotenv.config({ path: findConfig('.env') || undefined });

const app = express();
app.use(express.json());

// TODO uncomment when ready
// app.use('/.well-known', wellknown);

let redisClient;

(async () => {
  redisClient = createClient();

  redisClient.on('error', (error) => console.error(`Redis Error : ${error}`));

  await redisClient.connect();
})();

app.locals.redisClient = redisClient;

const redisStore = new RedisStore({
  client: redisClient,
  prefix: 'wiki0:',
});

const cookieSecret = process.env.COOKIE_SECRET;
if (!cookieSecret) {
  throw new Error('Missing env variable COOKIE_SECRET');
}

app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: cookieSecret,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
    },
    // override the default cookie name so we can run both the app and auth server on localhost
    name: WIKI_COOKIE_NAME,
    store: redisStore,
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(async (dbUser: PrismaUser, done) => {
  done(null, dbUser.id);
});

passport.deserializeUser(async (id: number, done) => {
  const dbUser = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  done(null, dbUser);
});

passport.use(JWT_STRATEGY_NAME, jwtStrategy);

const authenticated: RequestHandler = (req, res, next) => {
  if (req.isUnauthenticated()) {
    passport.authenticate(JWT_STRATEGY_NAME, {
      session: false,
      passReqToCallback: true,
      failWithError: false,
    })(req, res, next);
    return;
  }

  next();
};

app.use('/api/articles', authenticated, article);
app.use('/api/users', authenticated, user);
app.use('/api/tokens', authenticated, authtoken);
app.use('/api/openid/', oidc);

ViteExpress.listen(app, 3000, () => console.log('Server is listening on port 3000...'));
