/* eslint-disable import/prefer-default-export */
import { PrismaClient } from '@prisma/client/wiki';

const prisma = new PrismaClient();

export async function insertUsers() {
  const org = await prisma.organization.create({
    data: {
      domain: 'tables.fake',
      name: 'Fake Org',
      auth_server_key: 'customer1',
    },
  });

  const bobbyUser = await prisma.user.create({
    data: {
      name: 'Bobby Tables',
      email: 'bob@tables.fake',
      orgId: org.id,
      externalId: 'bob@tables.fake',
    },
  });
  console.log('Created user Bobby Tables', bobbyUser);

  const trinityUser = await prisma.user.create({
    data: {
      name: 'Trinity',
      email: 'trinity@whiterabbit.fake',
      orgId: org.id,
    },
  });
  console.log('Created user Trinity', trinityUser);
}
