import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionStr = cookieStore.get('wingman_session')?.value;

    if (!sessionStr) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const session = JSON.parse(sessionStr);

    const { db } = await import('@/lib/db');
    const allUsers = await db.getAllUsers();
    const freshUser = allUsers.find(u => u.id === session.id);

    if (!freshUser) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: freshUser.id,
        email: freshUser.email,
        name: freshUser.name,
        role: freshUser.role,
        timezone: freshUser.timezone,
        dob: freshUser.dob,
        location: freshUser.location,
        language: freshUser.language,
        profilePic: freshUser.profilePic,
        hasGoogleCalendar: !!(freshUser as any).googleAccessToken
      }
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
