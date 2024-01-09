import { User } from '@prisma/client/todo';
import { Router } from 'express';
import prisma from '../../../prisma/client';

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
