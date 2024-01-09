import type { User as PrismaUser } from '@prisma/client/todo';
import type { JWTPayload } from 'jose';

declare global {
  namespace Express {
    interface User extends PrismaUser {}

    interface Request {
      user?: User;
      jwt?: JWTPayload;
    }
  }
}
