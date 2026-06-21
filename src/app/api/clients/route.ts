import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const clients = await db.getClients();
    // Sort by slNo ascending, then createdAt descending
    const sorted = [...clients].sort((a, b) => {
      if (a.slNo != null && b.slNo != null) return a.slNo - b.slNo;
      if (a.slNo != null) return -1;
      if (b.slNo != null) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return NextResponse.json(sorted);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const client = await db.createClient({
      name: body.name,
      number: body.number || null,
      whichService: body.whichService || null,
      enquiry: body.enquiry || null,
      status: body.status || 'Contacted',
      paid: body.paid === true || body.paid === 'true',
      workDetails: body.workDetails || null,
      amount: body.amount || null,
      websiteLinks: body.websiteLinks || null,
      date: body.date || null,
      slNo: body.slNo != null ? Number(body.slNo) : null,
    });
    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
  }
}
