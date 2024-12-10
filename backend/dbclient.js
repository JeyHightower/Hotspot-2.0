"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const userValidate = client_1.Prisma.defineExtension({
    name: "userValidate",
    query: {
        user: {
            create({ args, query }) {
                if (args.data.username.length < 4) {
                    throw Error("username length less than 4");
                }
                else if (args.data.email.length < 3) {
                    throw Error("email length less than 3");
                }
                else if (args.data.hashedPassword.length != 60) {
                    throw Error("hashed password not of length 60");
                }
                return query(args);
            },
        },
    },
});
exports.prisma = new client_1.PrismaClient().$extends(userValidate);
