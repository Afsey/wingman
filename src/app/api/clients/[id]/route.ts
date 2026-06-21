import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const clients = await db.getClients();
    const client = clients.find(c => c.id === id);
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }
    return NextResponse.json(client);
  } catch (error) {
    console.error('Error fetching client:', error);
    return NextResponse.json({ error: 'Failed to fetch client' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updates: Record<string, unknown> = {};

    if (body.name !== undefined) updates.name = body.name;
    if (body.number !== undefined) updates.number = body.number;
    if (body.whichService !== undefined) updates.whichService = body.whichService;
    if (body.enquiry !== undefined) updates.enquiry = body.enquiry;
    if (body.status !== undefined) updates.status = body.status;
    if (body.paid !== undefined) updates.paid = body.paid === true || body.paid === 'true';
    if (body.workDetails !== undefined) updates.workDetails = body.workDetails;
    if (body.amount !== undefined) updates.amount = body.amount;
    if (body.websiteLinks !== undefined) updates.websiteLinks = body.websiteLinks;
    if (body.date !== undefined) updates.date = body.date;
    if (body.slNo !== undefined) updates.slNo = body.slNo != null ? Number(body.slNo) : null;

    const updatedClient = await db.updateClient(id, updates as any);
    return NextResponse.json(updatedClient);
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.deleteClient(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 });
  }
}
