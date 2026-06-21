import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db, hashPassword } from '@/lib/db';

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionStr = cookieStore.get('wingman_session')?.value;
    
    if (!sessionStr) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = JSON.parse(sessionStr);
    const body = await request.json();
    const { name, dob, newPassword, location, timezone, language, profilePic } = body;

    const updates: any = {};
    if (name) updates.name = name;
    if (dob !== undefined) updates.dob = dob;
    if (location !== undefined) updates.location = location;
    if (timezone) updates.timezone = timezone;
    if (language !== undefined) updates.language = language;

    if (profilePic) {
      if (profilePic.startsWith('data:image')) {
        try {
          const { uploadBase64ToSupabase } = await import('@/lib/supabaseClient');
          const ext = profilePic.match(/data:image\/([a-zA-Z]+);/)?.[1] || 'jpg';
          const filename = `avatars/user_${session.id}_${Date.now()}.${ext}`;
          
          const publicUrl = await uploadBase64ToSupabase(profilePic, filename);
          updates.profilePic = publicUrl;
        } catch (e: any) {
          console.warn('Supabase upload failed or not configured, falling back to base64 DB storage', e.message);
          // Fallback to storing raw base64 in DB for now so the app doesn't break
          updates.profilePic = profilePic;
        }
      } else {
        // It's already a URL
        updates.profilePic = profilePic;
      }
    }

    if (newPassword) {
      if (newPassword.length < 8) {
        return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
      }
      updates.passwordHash = hashPassword(newPassword);
    }

    const updatedUser = await db.updateUser(session.id, updates);

    // Update the session cookie if the name changed so the layout stays in sync
    if (name && name !== session.name) {
      const newSession = { ...session, name: updatedUser.name };
      cookieStore.set('wingman_session', JSON.stringify(newSession), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7 // 1 week
      });
    }

    await db.addActivityLog({
      userId: session.id,
      userName: updatedUser.name,
      action: 'PROFILE_UPDATE',
      details: 'User updated their personal profile data.'
    });

    const { passwordHash, ...safeUser } = updatedUser;
    return NextResponse.json({ success: true, user: safeUser });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
