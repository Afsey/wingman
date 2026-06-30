import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const prisma = db.prismaClient;

    let categories;
    if (userId) {
      categories = await prisma.financeCategory.findMany({
        where: { userId },
        orderBy: { name: 'asc' },
      });
    } else {
      categories = await prisma.financeCategory.findMany({
        orderBy: { name: 'asc' },
      });
    }

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const prisma = db.prismaClient;
    const body = await request.json();
    const { name, icon, budget, userId } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const newCategory = await prisma.financeCategory.create({
      data: {
        name,
        icon,
        budget: budget ? parseFloat(budget) : 0.0,
        userId: userId || null,
      },
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
