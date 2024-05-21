import { Router } from 'express';
// eslint-disable-next-line import/no-relative-packages
import { User } from '../../../prisma/client';
import prisma from '../prisma';

const controller = Router();

controller.get('/me', async (req, res) => {
  const user: User = await prisma.user.findUniqueOrThrow({
    where: {
      id: req.user!.id,
    },
  });

  res.json({ ...user });
});

export default controller;
