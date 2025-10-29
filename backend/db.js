import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export const testPrismaConnection = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Connected to database');
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    throw err;
  }
};
