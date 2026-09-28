import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getSupabaseAdmin } from '@/lib/supabase/client';
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

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: 'Database service unavailable' }, { status: 500 });
    }

    const email = session.user.email?.toLowerCase().trim();

    if (action === 'register') {
      if (!token) {
        return NextResponse.json({ error: 'FCM Token required' }, { status: 400 });
      }

      // Fetch user's current fcm_tokens
      const { data: user } = await supabase
        .from('users')
        .select('fcm_tokens')
        .eq('email', email)
        .maybeSingle();

      const existingTokens = user?.fcm_tokens || [];
      if (!existingTokens.includes(token)) {
        const updatedTokens = [...existingTokens, token];
        await supabase
          .from('users')
          .update({ fcm_tokens: updatedTokens })
          .eq('email', email);
      }

      logger.info('FCM Token registered', { email });
      return NextResponse.json({ success: true, message: 'FCM token registered successfully' });
    }

    if (action === 'send_test') {
      const { data: user } = await supabase
        .from('users')
        .select('fcm_tokens')
        .eq('email', email)
        .maybeSingle();

      if (!user?.fcm_tokens || user.fcm_tokens.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'No registered device tokens found for this user',
        }, { status: 400 });
      }

      const result = await sendPushNotification(user.fcm_tokens, {
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
