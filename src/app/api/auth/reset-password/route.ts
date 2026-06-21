import { NextResponse } from 'next/server';
import { db, consumeResetToken, hashPassword } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    const email = consumeResetToken(token);
    if (!email) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
    }

    const user = await db.getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: 'User no longer exists' }, { status: 400 });
    }

    // Update password hash
    // We cannot update user directly through db.updateUser without exposing passwordHash in the API
    // Let's check what updateUser supports. It supports partial updates but typically omits id, email, phone, createdAt, updatedAt.
    // However, the interface Omit<User, ...> doesn't omit passwordHash. Let's try.
    await db.updateUser(user.id, { passwordHash: hashPassword(newPassword) });

    await db.addActivityLog({
      userId: user.id,
      userName: user.name,
      action: 'PASSWORD_RESET',
      details: 'User successfully reset their password using token'
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
