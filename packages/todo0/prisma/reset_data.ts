import { PrismaClient } from './client';
import { insertUsers } from './seed_script';

const client = new PrismaClient();

async function main() {
  try {
    await insertUsers();
  } catch (e: unknown) {
    console.error(e);
    throw e;
  } finally {
    await client.$disconnect();
  }
}

main().catch(() => process.exit(1));
