import type { JWTPayload } from 'jose';
// eslint-disable-next-line import/no-relative-packages
import type { User as PrismaUser } from '../../../prisma/client';

declare global {
  namespace Express {
    interface User extends PrismaUser {}

    interface Request {
      user?: User;
      jwt?: JWTPayload;
    }
  }
}
