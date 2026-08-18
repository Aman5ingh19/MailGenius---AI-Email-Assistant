import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
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
    await connectDB();
    const dbUser = await User.findById(session.user.id);
    const existingPublicId = dbUser?.cloudinaryPublicId || null;

    // Use user ID as public_id so re-uploads overwrite the same file
    const publicId = `mailgenius/avatars/${session.user.id}`;
    const { url } = await uploadToCloudinary(buffer, { publicId });

    // ── Save URL to MongoDB ───────────────────────────────────────────────────
    await User.findByIdAndUpdate(session.user.id, {
      image: url,
      cloudinaryPublicId: publicId,
    });

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

    await connectDB();
    const publicId = `mailgenius/avatars/${session.user.id}`;
    await deleteFromCloudinary(publicId);
    await User.findByIdAndUpdate(session.user.id, { image: null, cloudinaryPublicId: null });

    logResponse('DELETE /api/user/avatar', 200, Date.now() - start);
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error in DELETE /api/user/avatar', { error: error?.message });
    return NextResponse.json({ error: 'Failed to remove avatar.' }, { status: 500 });
  }
}
