import { PrismaClient } from "@prisma/client";
export const prisma = new PrismaClient();
// For development logging
if (process.env.NODE_ENV === "development") {
    prisma.$use(async (params, next) => {
        const before = Date.now();
        const result = await next(params);
        const after = Date.now();
        console.log(`Query ${params.model}.${params.action} took ${after - before}ms`);
        return result;
    });
}
export default prisma;
