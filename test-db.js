const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const dotenv = require('dotenv');
dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const meeting = await prisma.meeting.create({
      data: {
        title: 'Test Meeting Script',
        startTime: new Date('2026-06-21T09:00:00.000Z'),
        endTime: new Date('2026-06-21T10:00:00.000Z'),
        type: 'meeting',
        status: 'scheduled'
      }
    });
    console.log('Success:', meeting);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
