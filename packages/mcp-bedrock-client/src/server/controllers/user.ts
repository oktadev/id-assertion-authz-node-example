import { Router } from 'express';
import prisma from '../../prisma';

const controller: Router = Router();

controller.get('/me', async (req, res) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: req.user!.id,
    },
  });

  res.json({ ...user });
});

export default controller;
