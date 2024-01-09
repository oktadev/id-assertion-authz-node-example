import { Router } from 'express';
import prisma from '../../../prisma/client';

const controller = Router();

controller.get('/', async (req, res) => {
  const user = req.user!;
  const tokens = await prisma.authorizationToken.findMany({
    where: {
      orgId: user.orgId,
      userId: user.id,
    },
  });

  res.send({ tokens });
});

export default controller;
