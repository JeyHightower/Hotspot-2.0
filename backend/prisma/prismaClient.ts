import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { watch } from 'fs';

declare global {
  var prisma: PrismaClient | undefined
}

const prisma = global.prisma || new PrismaClient();

if (!global.prisma) {
  global.prisma = prisma;
}

dotenv.config();

// Add file watching
watch('./prisma', (eventType, filename) => {
  if (filename) {
    console.log(`Detected ${eventType} in ${filename}`);
    // You can add specific actions here when schema changes
  }
});

if (process?.env?.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export const prismaClient = prisma;