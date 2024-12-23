import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

declare global {
  var prisma: PrismaClient | undefined
}

const prisma = global.prisma || new PrismaClient();

if (!global.prisma) {
  global.prisma = prisma;
}

dotenv.config();

export const prismaClient = prisma;