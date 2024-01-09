import { dirname } from 'desm';
import express from 'express'; // eslint-disable-line import/no-unresolved
import session from 'express-session';
import * as path from 'node:path';
import Provider from 'oidc-provider';
import passport from 'passport';
import jwtAuthorizationGrant from './jwt-authorization-grant.js';
import routes from './routes.js';
import makeConfiguration from './server-configuration.js';
import tokenExchange from './token-exchange.js';

const __dirname = dirname(import.meta.url);


const PORT = process.env.AUTH_SERVER_PORT;
const ISSUER = process.env.AUTH_SERVER;

const app = express();

app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: 'top secret',
  cookie: {
    http: false,
    sameSite: 'lax'
  }
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(async (user, done) => {
  done(null, user);
});

passport.deserializeUser(async (id, done) => {
  done(null, id);
});


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const provider = new Provider(ISSUER, await makeConfiguration());
routes(app, provider);
await jwtAuthorizationGrant(app, provider);
await tokenExchange(app, provider);
app.use(provider.callback());

let server = null;
try {
  server = app.listen(PORT, () => {
    console.log(`application is listening on port ${PORT}: ${ISSUER}/.well-known/openid-configuration`);
  });
} catch (err) {
  if (server?.listening) server.close();
  console.error(err);
  process.exitCode = 1;
}
