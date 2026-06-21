import { NextRequest, NextResponse } from 'next/server';
import { getGoogleOAuthClient } from '@/lib/googleCalendar';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');
  const userId = searchParams.get('state'); // We passed userId as state

  if (!code || !userId) {
    return NextResponse.json({ error: 'Missing code or user ID' }, { status: 400 });
  }

  try {
    const oauth2Client = getGoogleOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);

    // Save tokens to database for this user
    await db.updateUser(userId, {
      googleAccessToken: tokens.access_token || undefined,
      googleRefreshToken: tokens.refresh_token || undefined,
      googleTokenExpiry: tokens.expiry_date ? BigInt(tokens.expiry_date) : undefined,
    } as any);

    // Redirect back to the meetings page
    return NextResponse.redirect(new URL('/dashboard/meetings', req.url));
  } catch (error) {
    console.error('Error in Google Auth Callback:', error);
    return NextResponse.redirect(new URL('/dashboard/meetings?error=google_auth_failed', req.url));
  }
}
