import dotenv from 'dotenv';
import type { Request } from 'express';
import findConfig from 'find-config';
import { passportJwtSecret } from 'jwks-rsa';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import prisma from '../../prisma';

// Find the nearest .env and load it into process.ENV
dotenv.config({ path: findConfig('.env') || undefined });

const authServer = process.env.AUTH_SERVER;

// eslint-disable-next-line @typescript-eslint/naming-convention
export const JWT_STRATEGY_NAME = 'jwt' as const;

// eslint-disable-next-line import/prefer-default-export
export const jwtStrategy = new JwtStrategy(
  {
    secretOrKeyProvider: passportJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `${authServer}/jwks`,
    }),
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    issuer: authServer,
    audience: `${process.env.WIKI_SERVER}/`,
    algorithms: ['RS256'],
    passReqToCallback: true,
  },
  async (req: Request, jwt, done) => {
    const { sub: externalId } = jwt;

    if (!externalId) {
      done(new Error(`Could not parse jwt.sub for org and user id: ${JSON.stringify(jwt)}`));
      return;
    }

    try {
      const user = await prisma.user.findFirst({
        where: {
          externalId,
        },
      });

      done(null, user);
    } catch (err: unknown) {
      if (err instanceof Error) {
        done(err);
        return;
      }

      done(new Error(`Error in JwtStrategy ${err}`));
    }
  }
);
