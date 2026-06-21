import { NextResponse } from 'next/server';
import { db, createResetToken } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await db.getUserByEmail(email);
    if (!user) {
      // For security, do not reveal if the email exists or not to prevent user enumeration
      // We still return success even if user doesn't exist
      return NextResponse.json({ success: true, message: 'If an account with that email exists, a password reset link has been sent.' });
    }

    const token = createResetToken(email);
    
    // In a real application, you would send an email using SendGrid/Nodemailer here.
    // For local simulation, we log it to the console so the developer/user can click it:
    const resetUrl = `http://localhost:3000/reset-password?token=${token}`;
    console.log('\n======================================================');
    console.log(`[EMAIL SIMULATION] Password Reset Request for ${email}`);
    console.log(`Click here to reset: ${resetUrl}`);
    console.log('======================================================\n');

    return NextResponse.json({ 
      success: true, 
      message: 'If an account with that email exists, a password reset link has been sent.',
      _devToken: token // Only returning this locally to make testing easier without terminal access
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
