import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase/client';
import nodemailer from 'nodemailer';

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ message: 'If an account exists, a password reset link has been sent.' }, { status: 200 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', normalizedEmail)
      .maybeSingle();

    // Security practice: generic message even if user not found
    if (!user || user.provider !== 'credentials') {
      return NextResponse.json(
        { message: 'If an account exists, a password reset link has been sent.' },
        { status: 200 }
      );
    }

    const token = crypto.randomBytes(32).toString('hex');

    // Delete old tokens and insert new one
    await supabase.from('reset_tokens').delete().eq('email', user.email);
    await supabase.from('reset_tokens').insert({
      email: user.email,
      token,
    });

    const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('EMAIL_USER or EMAIL_PASS is missing in .env.local. Token generated but email not sent. Reset link:', resetUrl);
      return NextResponse.json(
        { message: 'If an account exists, a password reset link has been sent. (Check server console for link if SMTP is not configured)' },
        { status: 200 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"MailGenius" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Password Reset Request - MailGenius',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
          <h2 style="color: #333; text-align: center;">Reset Your Password</h2>
          <p style="color: #555; font-size: 16px;">
            Hello ${user.name || 'User'},<br><br>
            We received a request to reset the password for your MailGenius account. If you didn't make this request, you can safely ignore this email.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #8B2C39; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
              Reset Password
            </a>
          </div>
          <p style="color: #777; font-size: 14px; text-align: center;">
            This link will expire in 1 hour.<br>
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${resetUrl}" style="color: #8B2C39;">${resetUrl}</a>
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: 'If an account exists, a password reset link has been sent.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request.' },
      { status: 500 }
    );
  }
}
