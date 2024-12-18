import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
const globalForPrisma = global as unknown as { prisma: PrismaClient }


export default prisma
