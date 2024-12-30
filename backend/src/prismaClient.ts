import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

if (process.env.NODE_ENV === "production") {
  console.log("Database URL:", process.env.DATABASE_URL);
  console.log("Initializing Prisma Client in production mode");
}

export const prismaClient = prisma;
