"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("./client");
const seed_script_1 = require("./seed_script");
const client = new client_1.PrismaClient();
async function main() {
    try {
        await (0, seed_script_1.insertUsers)();
    }
    catch (e) {
        console.error(e);
        throw e;
    }
    finally {
        await client.$disconnect();
    }
}
main().catch(() => process.exit(1));
//# sourceMappingURL=reset_data.js.map