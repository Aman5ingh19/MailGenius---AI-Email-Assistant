import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { sendPushNotification } from '@/lib/firebase/admin';
import logger from '@/lib/logger';

export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, token, title, message } = body;

    await connectDB();

    if (action === 'register') {
      if (!token) {
        return NextResponse.json({ error: 'FCM Token required' }, { status: 400 });
      }

      // Add token without duplicates
      await User.findOneAndUpdate(
        { email: session.user.email },
        { $addToSet: { fcmTokens: token } }
      );

      logger.info('FCM Token registered', { email: session.user.email });
      return NextResponse.json({ success: true, message: 'FCM token registered successfully' });
    }

    if (action === 'send_test') {
      const user = await User.findOne({ email: session.user.email });
      if (!user?.fcmTokens || user.fcmTokens.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'No registered device tokens found for this user',
        }, { status: 400 });
      }

      const result = await sendPushNotification(user.fcmTokens, {
        title: title || '⚡ MailGenius Test Alert',
        body: message || 'Firebase Cloud Messaging push notification test successful!',
        data: { url: '/dashboard' },
      });

      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    logger.error('Notifications API Error:', { error: err.message });
    return NextResponse.json({ error: 'Internal server error', details: err.message }, { status: 500 });
  }
}
