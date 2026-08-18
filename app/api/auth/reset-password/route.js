import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import ResetToken from '@/lib/models/ResetToken';

export async function POST(req) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    await connectDB();

    // Find the token
    const resetTokenRecord = await ResetToken.findOne({ token });

    if (!resetTokenRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired token. Please request a new password reset.' },
        { status: 400 }
      );
    }

    // Find the user
    const user = await User.findOne({ email: resetTokenRecord.email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found.' },
        { status: 404 }
      );
    }

    // Hash the new password
    const hashed = await bcrypt.hash(newPassword, 12);

    // Update the user's password
    user.password = hashed;
    await user.save();

    // Delete the used token
    await ResetToken.deleteOne({ _id: resetTokenRecord._id });

    return NextResponse.json(
      { message: 'Password has been successfully reset.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'An error occurred while resetting your password.' },
      { status: 500 }
    );
  }
}
