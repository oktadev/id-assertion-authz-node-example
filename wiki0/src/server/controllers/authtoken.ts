import { Router } from 'express';
import { createClient } from 'redis';
import prisma from '../../../prisma/client';

const controller = Router();

const getTokenDebugInfo = async (idToken: string | null): Promise<Record<string, any>> => {
  const subject_token_type = 'urn:ietf:params:oauth:token-type:id_token';
  // Tack on hardcoded request body for debug console demonstration purposes
  const requestBody = {
    grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
    requested_token_type: 'urn:ietf:params:oauth:token-type:id-jag',
    subject_token_type,
    resource: `${process.env.TODO_AUTH_SERVER}/token`,
    scope: 'read write',
    subject_token: '',
    client_id: '<CLIENT_ID>',
    client_secret: '<CLIENT_SECRET>',
  };

  const url = `${process.env.AUTH_SERVER}/token`;

  const responseBody = {
    access_token: '', // frontend can tack on access token
    issued_token_type: 'urn:ietf:params:oauth:token-type:id-jag',
    token_type: 'N_A',
    expires_in: 300,
  };

  if (idToken) {
    // Get original IdP subject token from auth server to display in debug console
    try {
      const redisClient = createClient({
        url: process.env.REDIS_SERVER,
      });
      redisClient.connect().catch(console.error);
      const type = await redisClient.get('jag_subject_token_type');
      const assertion = await redisClient.get('jag_subject_token');
      console.log('{type, assertion}', { type, assertion });

      if (type === 'saml') {
        requestBody.subject_token_type = 'urn:ietf:params:oauth:token-type:saml2';
      }
      requestBody.subject_token = assertion || '';
    } catch (e) {
      console.log(e);
    }
  }
  return { requestBody, responseBody, url };
};

controller.get('/', async (req, res) => {
  const user = req.user!;
  const tokens = await prisma.authorizationToken.findMany({
    where: {
      orgId: user.orgId,
      userId: user.id,
    },
  });

  if (!tokens?.length) {
    res.send({ tokens });
    return;
  }

  const { idToken } = tokens[0];
  const { requestBody, responseBody, url } = await getTokenDebugInfo(idToken);

  res.send({ tokens, requestBody, responseBody, url });
});

export default controller;
