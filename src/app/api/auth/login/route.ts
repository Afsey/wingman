import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db, verifyPassword } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { usernameOrEmail, password, phone, loginMethod, dob } = body;

    if (!usernameOrEmail || !phone) {
      return NextResponse.json(
        { error: 'Please fill Username/Email and Phone Number.' },
        { status: 400 }
      );
    }

    if (loginMethod === 'password' && !password) {
      return NextResponse.json({ error: 'Please enter your password.' }, { status: 400 });
    }
    
    if (loginMethod === 'dob' && !dob) {
      return NextResponse.json({ error: 'Please enter your Date of Birth.' }, { status: 400 });
    }

    // Try finding by email
    let user = await db.getUserByEmail(usernameOrEmail);
    
    // If not found, see if we can find by username (if name matches)
    if (!user) {
      const allUsers = await db.getAllUsers();
      user = allUsers.find(u => u.name.toLowerCase() === usernameOrEmail.toLowerCase()) || null;
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found with that Username/Email.' },
        { status: 401 }
      );
    }

    // Verify phone number (remove spacing/plus to be slightly flexible, but match strictly if required)
    const cleanPhone = (p: string) => p.replace(/[\s\-]/g, '');
    if (cleanPhone(user.phone) !== cleanPhone(phone)) {
      return NextResponse.json(
        { error: 'Phone number does not match registered user.' },
        { status: 401 }
      );
    }

    // Verify authentication factor
    if (loginMethod === 'password') {
      const isPasswordValid = verifyPassword(password, user.passwordHash);
      if (!isPasswordValid) {
        return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
      }
    } else if (loginMethod === 'dob') {
      if (!user.dob || user.dob !== dob) {
        return NextResponse.json({ error: 'Incorrect Date of Birth.' }, { status: 401 });
      }
    } else {
      return NextResponse.json({ error: 'Invalid login method.' }, { status: 400 });
    }

    // Log the successful login activity
    await db.addActivityLog({
      userId: user.id,
      userName: user.name,
      action: 'LOGIN',
      details: `User logged in from login portal. Timezone: ${user.timezone}`
    });

    // Set cookie session
    const cookieStore = await cookies();
    cookieStore.set('wingman_session', JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      timezone: user.timezone,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        timezone: user.timezone
      }
    });

  } catch (error: any) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred during login.' },
      { status: 500 }
    );
  }
}
