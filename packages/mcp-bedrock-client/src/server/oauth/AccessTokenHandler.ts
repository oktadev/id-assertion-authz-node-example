import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
// import { User } from '@prisma/client/wiki';
import prisma from '../../prisma';

class AccessTokenHandler {
  /**
   * Loads the access token from the database for the given <user, resource>.  This method will refresh the token
   * if it is expired.
   */
  async loadToken(
    user: any,
    resource: string,
    retryCount: number = 0
  ): Promise<[string] | [undefined, 'NoToken' | 'RetryLater']> {
    const authToken = await prisma.authorizationToken.findUnique({
      where: {
        orgId_userId_resource: {
          orgId: user.orgId,
          userId: user.id,
          resource,
        },
      },
    });

    if (!authToken) {
      return [undefined, 'NoToken'];
    }

    if (!authToken.expiresAt || Date.now() < authToken.expiresAt.getTime()) {
      return [authToken.accessToken];
    }

    if (!authToken.refreshToken) {
      return [undefined, 'NoToken'];
    }

    // Otherwise perform a refresh
    try {
      const updatingToken = await prisma.authorizationToken.update({
        where: {
          id: authToken.id,
          status: 'ACTIVE',
        },
        data: {
          status: 'REFRESHING',
        },
      });

      const tokenEndpoint = process.env[`${authToken.resource}_TOKEN_ENDPOINT`]!;
      const clientId = process.env[`${authToken.resource}_CLIENT_ID`];
      const clientSecret = process.env[`${authToken.resource}_CLIENT_SECRET`];
      const response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'refresh_token',
          refresh_token: updatingToken.refreshToken,
          client_id: clientId,
          client_secret: clientSecret,
        }),
      });

      const token = (await response.json()) as {
        access_token: string;
        expires_in?: number;
        refresh_token: string;
      };

      const refreshedToken = await prisma.authorizationToken.update({
        where: {
          id: authToken.id,
        },
        data: {
          status: 'ACTIVE',
          accessToken: token.access_token,
          refreshToken: token.refresh_token,
          expiresAt: token.expires_in ? new Date(Date.now() + token.expires_in) : null,
        },
      });

      return [refreshedToken.accessToken];
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2001') {
          if (retryCount === 10) {
            return [undefined, 'RetryLater'];
          }

          // sleep for a litte bit
          await new Promise((r) => {
            setTimeout(r, 100);
          });
          return this.loadToken(user, resource, retryCount + 1);
        }
      }

      throw error;
    }
  }
}

export default AccessTokenHandler;
