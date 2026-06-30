import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const accountId = searchParams.get('accountId');

    let whereClause: any = {};
    if (userId) whereClause.userId = userId;
    if (accountId) whereClause.accountId = accountId;

    const transactions = await prisma.financeTransaction.findMany({
      where: whereClause,
      include: {
        account: true,
        category: true,
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, amount, type, misc, accountId, categoryId, userId } = body;

    if (!amount || !type || !accountId) {
      return NextResponse.json({ error: 'Amount, type, and accountId are required' }, { status: 400 });
    }

    const parsedAmount = parseFloat(amount);

    // Use a transaction to create the record and update the account balance
    const result = await prisma.$transaction(async (tx) => {
      const newTx = await tx.financeTransaction.create({
        data: {
          date: new Date(date || new Date()),
          amount: parsedAmount,
          type,
          misc,
          accountId,
          categoryId: categoryId || null,
          userId: userId || null,
        },
        include: {
          account: true,
          category: true,
        },
      });

      // Update the account balance
      const account = await tx.financeAccount.findUnique({ where: { id: accountId } });
      if (account) {
        let newBalance = account.balance;
        
        // Basic logic: Income/Refund increases balance, Expense/Payment decreases it
        // For credit cards, balance might represent what you owe, so this logic could be inverted
        // but typically a positive balance is cash on hand.
        if (type === 'Income' || type === 'Refund' || type === 'Transfer In') {
          newBalance += parsedAmount;
        } else if (type === 'Expense' || type === 'Payment' || type === 'Transfer Out') {
          newBalance -= parsedAmount;
        }

        await tx.financeAccount.update({
          where: { id: accountId },
          data: { balance: newBalance },
        });
      }

      return newTx;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}
