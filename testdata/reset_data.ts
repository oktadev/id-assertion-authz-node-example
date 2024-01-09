import { PrismaClient as TodoClient } from '@prisma/client/todo';
import { PrismaClient as WikiClient } from '@prisma/client/wiki';
import { insertUsers as insertTodoUsers } from '../todo0/prisma/seed_script';
import { insertUsers as insertWikiUsers } from '../wiki0/prisma/seed_script';

const todoClient = new TodoClient();
const wikiClient = new WikiClient();

async function main() {
  await insertTodoUsers();
  await insertWikiUsers();
}

main()
  .then(async () => {
    await todoClient.$disconnect();
    await wikiClient.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await todoClient.$disconnect();
    await wikiClient.$disconnect();
    process.exit(1);
  });
