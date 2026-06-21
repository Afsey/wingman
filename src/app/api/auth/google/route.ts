import { NextRequest, NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/googleCalendar';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // For now, since there's no complex session management, we assume the admin user.
    const adminEmail = 'marketingwithafsal@gmail.com';
    const user = await db.getUserByEmail(adminEmail);

    if (!user) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 });
    }

    const authUrl = getAuthUrl(user.id);
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Error in Google Auth:', error);
    return NextResponse.json({ error: 'Failed to initiate Google Auth' }, { status: 500 });
  }
}
