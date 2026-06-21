import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

async function verifyAdmin() {
  const cookieStore = await cookies();
  const sessionStr = cookieStore.get('wingman_session')?.value;
  if (!sessionStr) return null;
  try {
    const session = JSON.parse(sessionStr);
    return session.role === 'admin' ? session : null;
  } catch (e) {
    return null;
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await verifyAdmin();
    if (!session) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    
    // Prevent admin from deleting themselves
    if (id === session.id) {
      return NextResponse.json({ error: 'Cannot delete your own admin account.' }, { status: 400 });
    }

    const targetUser = await db.getUserById(id);
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const success = await db.deleteUser(id);
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }

    await db.addActivityLog({
      userId: session.id,
      userName: session.name,
      action: 'DELETE_USER',
      details: `Deleted user: ${targetUser.email}`
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await verifyAdmin();
    if (!session) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    
    // Admins cannot change someone else's email unless specifically requested, but let's allow basic fields
    const updates = {
      name: body.name,
      email: body.email,
      phone: body.phone,
      role: body.role,
      dob: body.dob,
      timezone: body.timezone,
      location: body.location,
      language: body.language,
    };

    const targetUser = await db.getUserById(id);
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updatedUser = await db.updateUser(id, updates);

    await db.addActivityLog({
      userId: session.id,
      userName: session.name,
      action: 'ADMIN_UPDATE_USER',
      details: `Admin updated details for user: ${targetUser.email}`
    });

    const { passwordHash, ...safeUser } = updatedUser;
    return NextResponse.json({ success: true, user: safeUser });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
