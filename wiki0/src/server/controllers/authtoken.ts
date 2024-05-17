import { Router } from 'express';
import prisma from '../../../prisma/client';
import { getJagTokenFromRedis } from '../redis/helpers';

const controller = Router();

controller.get('/', async (req, res) => {
  const user = req.user!;
  const savedSubjectToken = await getJagTokenFromRedis(user.externalId);
  const tokens = await prisma.authorizationToken.findMany({
    where: {
      orgId: user.orgId,
      userId: user.id,
    },
  });

  // Tack on hardcoded request body for debug console demonstration purposes
  const requestBody = {
    grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
    requested_token_type: 'urn:ietf:params:oauth:token-type:id-jag',
    subject_token_type: 'urn:ietf:params:oauth:token-type:id_token',
    resource: `${process.env.TODO_AUTH_SERVER}/token`,
    scope: 'read write',
    subject_token: savedSubjectToken, // frontend can tack this id token on
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

  res.send({ tokens, requestBody, responseBody, url });
});

export default controller;
