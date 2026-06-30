import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const prisma = db.prismaClient;

    let accounts;
    if (userId) {
      accounts = await prisma.financeAccount.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      accounts = await prisma.financeAccount.findMany({
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json(accounts);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const prisma = db.prismaClient;
    const body = await request.json();
    const { name, logoUrl, accountType, creditLimit, userId } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const newAccount = await prisma.financeAccount.create({
      data: {
        name,
        logoUrl,
        accountType: accountType || 'Savings Account',
        creditLimit: creditLimit ? parseFloat(creditLimit) : null,
        balance: 0.0,
        userId: userId || null,
      },
    });

    return NextResponse.json(newAccount, { status: 201 });
  } catch (error) {
    console.error('Error creating account:', error);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
