import { Router } from 'express';
// eslint-disable-next-line import/no-relative-packages
import { Todo } from '../../../prisma/client';
import prisma from '../prisma';

const controller = Router();

controller.get('/', async (req, res) => {
  const todos: Todo[] = await prisma.todo.findMany({
    where: {
      userId: req.user!.id,
    },
    orderBy: [
      {
        completed: 'asc',
      },
    ],
  });
  res.json({ todos });
});

controller.get('/:id', async (req, res) => {
  const idNum = Number(req.params.id);

  if (Number.isNaN(idNum)) {
    res.sendStatus(400);
    return;
  }

  const todo = await prisma.todo.findUnique({
    where: {
      id: idNum,
      userId: req.user!.id,
    },
  });
  res.json(todo);
});

controller.post('/', async (req, res) => {
  const { task } = req.body;
  const { id } = req.user!;
  const todo: Todo = await prisma.todo.create({
    data: {
      task,
      completed: false,
      user: { connect: { id } },
      org: { connect: { id: req.user!.orgId } },
    },
  });

  res.json(todo);
});

controller.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { task, completed } = req.body;
  let completedAt = null;

  if (completed) {
    completedAt = new Date().toISOString();
  }

  const todo: Todo = await prisma.todo.update({
    where: {
      id,
      userId: req.user!.id,
    },
    data: { task, completed, completedAt },
  });

  res.json(todo);
});

controller.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  await prisma.todo.delete({
    where: {
      id,
      userId: req.user!.id,
    },
  });

  res.sendStatus(204);
});

export default controller;
