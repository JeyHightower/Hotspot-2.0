"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
    engineType: 'binary'
});
exports.default = prisma;
//# sourceMappingURL=prismaClient.js.map