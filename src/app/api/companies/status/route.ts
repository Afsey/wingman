import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(req: NextRequest) {
  try {
    const { oldStatus, newStatus } = await req.json();

    if (!oldStatus || !newStatus) {
      return NextResponse.json({ error: 'Missing oldStatus or newStatus' }, { status: 400 });
    }

    const companies = await db.getCompanies();
    const companiesToUpdate = companies.filter(c => c.status === oldStatus);
    
    let updatedCount = 0;
    for (const company of companiesToUpdate) {
      await db.updateCompany(company.id, { status: newStatus });
      updatedCount++;
    }

    return NextResponse.json({ message: 'Success', updatedCount });
  } catch (error) {
    console.error('Error updating companies status:', error);
    return NextResponse.json({ error: 'Failed to update companies status' }, { status: 500 });
  }
}
