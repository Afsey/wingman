import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

async function verifyAdmin() {
  const cookieStore = await cookies();
  const sessionStr = cookieStore.get('wingman_session')?.value;
  if (!sessionStr) return false;
  try {
    const session = JSON.parse(sessionStr);
    return session.role === 'admin';
  } catch (e) {
    return false;
  }
}

export async function GET() {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const logs = await db.getActivityLogs();
    return NextResponse.json({ logs });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
