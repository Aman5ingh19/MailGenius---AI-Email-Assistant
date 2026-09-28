import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';
import { getSupabaseAdmin } from '@/lib/supabase/client';
import logger, { logRequest, logResponse } from '@/lib/logger';

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(request) {
  const start = Date.now();
  logRequest(request, 'POST /api/user/avatar');

  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('avatar');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No image uploaded.' }, { status: 400 });
    }

    // ── Validate ──────────────────────────────────────────────────────────────
    if (!ALLOWED_MIME.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.length > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'Image too large. Maximum size is 5 MB.' },
        { status: 400 }
      );
    }

    // ── Upload to Cloudinary ──────────────────────────────────────────────────
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: 'Database service unavailable' }, { status: 500 });
    }

    const publicId = `mailgenius/avatars/${session.user.id}`;
    const { url } = await uploadToCloudinary(buffer, { publicId });

    // ── Save URL to Supabase users table ──────────────────────────────────────
    await supabase
      .from('users')
      .update({
        image: url,
        cloudinary_public_id: publicId,
      })
      .eq('id', session.user.id);

    logger.info('Avatar updated', { userId: session.user.id, url });
    logResponse('POST /api/user/avatar', 200, Date.now() - start);
    return NextResponse.json({ url });

  } catch (error) {
    logger.error('Error in POST /api/user/avatar', { error: error?.message });
    logResponse('POST /api/user/avatar', 500, Date.now() - start);
    return NextResponse.json({ error: 'Failed to upload avatar.' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const start = Date.now();
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: 'Database service unavailable' }, { status: 500 });
    }

    const publicId = `mailgenius/avatars/${session.user.id}`;
    await deleteFromCloudinary(publicId);

    await supabase
      .from('users')
      .update({ image: null, cloudinary_public_id: null })
      .eq('id', session.user.id);

    logResponse('DELETE /api/user/avatar', 200, Date.now() - start);
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error in DELETE /api/user/avatar', { error: error?.message });
    return NextResponse.json({ error: 'Failed to remove avatar.' }, { status: 500 });
  }
}
