import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { watch } from 'fs';

declare global {
  var prisma: PrismaClient | undefined
}
if (!global.prisma) {
  global.prisma = new PrismaClient();
}

prisma = global.prisma;

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

export const prismaClient = global.prisma || prisma;

declare global {
  var prisma: PrismaClient | undefined
}
const prisma = new PrismaClient();

dotenv.config();

// Add file watching
watch('./prisma', (eventType, filename) => {
  if (filename) {
    console.log(`Detected ${eventType} in ${filename}`);
    // You can add specific actions here when schema changes
  }
});

export const prismaClient = global.prisma || prisma;
if (process?.env?.NODE_ENV !== 'production') {
    (global as { prisma?: PrismaClient }).prisma = prismaClient;
}