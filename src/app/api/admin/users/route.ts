import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db, hashPassword } from '@/lib/db';

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

    const users = await db.getAllUsers();
    // Strip passwords before sending to client
    const safeUsers = users.map(u => {
      const { passwordHash, ...rest } = u;
      return rest;
    });

    return NextResponse.json({ users: safeUsers });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, phone, role, password, timezone, dob } = body;

    if (!name || !email || !password || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user exists
    const existing = await db.getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    const newUser = await db.createUser({
      name,
      email,
      phone,
      passwordHash: hashPassword(password),
      role: role || 'user',
      timezone: timezone || 'UTC',
      dob: dob || null,
      profilePic: null
    });

    const cookieStore = await cookies();
    const sessionStr = cookieStore.get('wingman_session')?.value;
    const session = sessionStr ? JSON.parse(sessionStr) : null;

    if (session) {
      await db.addActivityLog({
        userId: session.id,
        userName: session.name,
        action: 'CREATE_USER',
        details: `Created new user: ${email}`
      });
    }

    const { passwordHash, ...safeUser } = newUser;
    return NextResponse.json({ success: true, user: safeUser });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
