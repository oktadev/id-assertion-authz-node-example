import dotenv from 'dotenv';
import { Router } from 'express';
import findConfig from 'find-config';
// eslint-disable-next-line import/no-relative-packages
import { Article, User } from '../../../prisma/client';
import prisma from '../../prisma';
import AccessTokenHandler from '../oauth/AccessTokenHandler';

type UnfurlLink =
  | {
      status: 'initiate' | 'unsupported';
    }
  | {
      status: 'unfurled';
      data: {
        icon: string;
        appName: string;
        text: string;
        secondaryText: string;
      };
    };

// Find the nearest .env and load it into process.ENV
dotenv.config({ path: findConfig('.env') || undefined });

const controller: Router = Router();

controller.get('/', async (req, res) => {
  const articles: Article[] = await prisma.article.findMany({
    where: {
      userId: req.user!.id,
    },
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
    },
  });
  res.json({ articles });
});

controller.get('/:id', async (req, res) => {
  const idNum = Number(req.params.id);

  if (Number.isNaN(idNum)) {
    res.sendStatus(400);
    return;
  }

  const article = await prisma.article.findUnique({
    where: {
      id: idNum,
      userId: req.user!.id,
    },
  });
  res.json(article);
});

controller.post('/', async (req, res) => {
  const { title, content } = req.body;
  const { id } = req.user!;
  const article: Article = await prisma.article.create({
    data: {
      title,
      content,
      user: { connect: { id } },
      org: { connect: { id: req.user!.orgId } },
    },
  });

  res.json(article);
});

/**
 * Creates a demo article to showcase Wiki0 functionality to end users
 */
controller.post('/demo', async (req, res) => {
  const { id } = req.user!;
  const article: Article = await prisma.article.create({
    data: {
      title: 'A Nifty Article',
      content: `
      <ul><li><p>This is a markdown editor.</p></li><li><p>You can use <em>most</em> of the markdown shortcuts you're used to.</p></li></ul ><h1>Create a header with the # sign</h1><h3>Also try out embedded links!</h3><h4>Embed links to Todo0 by typing <b>${process.env.TODO_SERVER}/todos/:id</b> or by copy/pasting a link directly from Todo0.</h4><p></p><p>An example looks like this: <a target="_blank" rel="noopener noreferrer nofollow" class="align-middle font-medium text-blue-600 dark:text-blue-500 hover:underline cursor-pointer" href="${process.env.TODO_SERVER}/todos/1"><span class="unfurled inline-flex items-center space-x-2 rounded-md px-2 py-1 font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20"><img src="${process.env.TODO_SERVER}/favicon.ico" class="size-6"><span class="font-bold">ToDo0</span><span class="text hover:underline">Coming Soon 1</span><span class="content hidden">${process.env.TODO_SERVER}/todos/1</span><span class="ml-2 inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Status</span></span></a></p>
      `,
      user: { connect: { id } },
      org: { connect: { id: req.user!.orgId } },
    },
  });

  res.json(article);
});

controller.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { title, content } = req.body;

  const article: Article = await prisma.article.update({
    where: {
      id,
      userId: req.user!.id,
    },
    data: { title, content },
  });

  res.json(article);
});

controller.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  await prisma.article.delete({
    where: {
      id,
      userId: req.user!.id,
    },
  });

  res.sendStatus(204);
});

type UnfurlConfig = {
  resource: string;
  // could probably use node path-to-regexp for better pattern matching here
  matcher: RegExp;
  icon: string;
  fetch: (
    user: User,
    accessToken: string,
    urlMatch: [UnfurlConfig, string[]]
  ) => Promise<UnfurlLink>;
};
const VALID_UNFURLS: UnfurlConfig[] = [
  {
    resource: 'CLIENT2',
    matcher: new RegExp(`${process.env.TODO_SERVER}/todos/(.+)`),
    icon: `${process.env.TODO_SERVER}/favicon.ico`,
    async fetch(user, accessToken, urlMatch) {
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };
      const response = await fetch(`${process.env.TODO_SERVER}/api/todos/${urlMatch[1][0]}`, {
        headers,
      });

      if (!response.ok) {
        return { status: 'unsupported' };
      }

      const todo = (await response.json()) as { id: number; task: string; completed: boolean };
      if (!todo) {
        return { status: 'unsupported' };
      }

      await prisma.requestLog.create({
        data: {
          userId: user.id,
          orgId: user.orgId,
          url: response.url,
          requestHeaders: JSON.stringify(headers),
          responseBody: JSON.stringify(todo),
          requestedAt: new Date(),
        },
      });

      return {
        status: 'unfurled',
        data: {
          appName: 'ToDo0',
          icon: urlMatch[0].icon,
          text: todo.task,
          secondaryText: todo.completed ? 'Completed' : 'Not Started',
        },
      };
    },
  },
];

controller.post('/unfurl', async (req, res) => {
  const user = req.user!;
  const urls = req.body.urls as string[];
  const accessTokenHandler = new AccessTokenHandler();

  const unfurlMap: Record<string, UnfurlLink> = {};
  for (const url of urls) {
    let urlMatch: [UnfurlConfig, string[]] | undefined;
    for (const u of VALID_UNFURLS) {
      if (!urlMatch) {
        const regexResults = u.matcher.exec(url);
        if (regexResults) {
          urlMatch = [u, regexResults.slice(1)];
        }
      }
    }
    if (urlMatch) {
      const accessToken = await accessTokenHandler.loadToken(user, urlMatch[0].resource);
      if (!accessToken[0]) {
        unfurlMap[url] = {
          status: 'unsupported',
        };
      } else {
        try {
          unfurlMap[url] = await urlMatch[0].fetch(user, accessToken[0], urlMatch);
        } catch (error) {
          console.log('Unfurl fetch request failed', error);
          unfurlMap[url] = { status: 'unsupported' };
        }
      }
    } else {
      unfurlMap[url] = { status: 'unsupported' };
    }
  }

  // tack on the request so we can display them in the debug console
  const requests = await prisma.requestLog.findMany({
    where: {
      orgId: user.orgId,
      userId: user.id,
    },
    orderBy: {
      requestedAt: 'desc',
    },
    take: 10,
  });
  res.json({ links: unfurlMap, requests });
});

export default controller;
