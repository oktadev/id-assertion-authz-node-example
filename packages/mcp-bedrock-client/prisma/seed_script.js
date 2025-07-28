"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertUsers = insertUsers;
/* eslint-disable import/prefer-default-export */
const client_1 = require("./client");
const prisma = new client_1.PrismaClient();
async function insertUsers() {
    const org = await prisma.organization.create({
        data: {
            domain: 'tables.fake',
            name: 'Fake Org',
            auth_server_key: 'customer1',
        },
    });
    const org2 = await prisma.organization.create({
        data: {
            domain: 'tables.fake2',
            name: 'Fake Org 2',
            auth_server_key: 'customer2',
        },
    });
    const org3 = await prisma.organization.create({
        data: {
            domain: 'tables.fake3',
            name: 'Fake Org 3',
            auth_server_key: 'customer3',
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
    const johnUser = await prisma.user.create({
        data: {
            name: 'John Doe',
            email: 'john@tables.fake2',
            orgId: org2.id,
            externalId: 'john@tables.fake2',
        },
    });
    console.log('Created user John', johnUser);
    const fooUser = await prisma.user.create({
        data: {
            name: 'Foo Bar',
            email: 'foo@tables.fake3',
            orgId: org3.id,
            externalId: 'foo@tables.fake3',
        },
    });
    console.log('Created user Foo', fooUser);
}
//# sourceMappingURL=seed_script.js.map