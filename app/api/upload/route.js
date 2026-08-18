import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import logger, { logRequest, logResponse } from '@/lib/logger';

// Supported MIME types for email file upload
const ALLOWED_TYPES = ['text/plain', 'message/rfc822', 'application/octet-stream'];
const MAX_SIZE_BYTES = 500 * 1024; // 500 KB

export async function POST(request) {
  const start = Date.now();
  logRequest(request, 'POST /api/upload');

  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // ── Parse multipart form data (Next.js App Router built-in, no Multer needed) ──
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    // ── Validate file type ────────────────────────────────────────────────────
    const fileName = file.name?.toLowerCase() || '';
    const mimeType = file.type || '';
    const isValidType =
      ALLOWED_TYPES.includes(mimeType) ||
      fileName.endsWith('.txt') ||
      fileName.endsWith('.eml');

    if (!isValidType) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a .txt or .eml file.' },
        { status: 400 }
      );
    }

    // ── Validate file size ────────────────────────────────────────────────────
    const buffer = await file.arrayBuffer();
    if (buffer.byteLength > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 500 KB.' },
        { status: 400 }
      );
    }

    // ── Extract text content ──────────────────────────────────────────────────
    const rawText = new TextDecoder('utf-8').decode(buffer);

    // For .eml files: strip headers (lines before first blank line)
    let emailBody = rawText;
    if (fileName.endsWith('.eml') || mimeType === 'message/rfc822') {
      const blankLineIndex = rawText.indexOf('\n\n');
      if (blankLineIndex !== -1) {
        emailBody = rawText.slice(blankLineIndex + 2).trim();
      }
      // Strip common MIME boundaries and encoded content indicators
      emailBody = emailBody
        .split('\n')
        .filter((line) => !line.startsWith('--') && !line.startsWith('Content-'))
        .join('\n')
        .trim();
    }

    // Clean up excessive whitespace
    emailBody = emailBody.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

    if (!emailBody) {
      return NextResponse.json({ error: 'Could not extract text from the uploaded file.' }, { status: 422 });
    }

    logger.info('File upload processed', {
      fileName: file.name,
      size: buffer.byteLength,
      userId: session.user.id,
    });

    logResponse('POST /api/upload', 200, Date.now() - start);
    return NextResponse.json({ text: emailBody, fileName: file.name });

  } catch (error) {
    logger.error('Error in POST /api/upload', { error: error?.message });
    logResponse('POST /api/upload', 500, Date.now() - start);
    return NextResponse.json({ error: 'Failed to process uploaded file.' }, { status: 500 });
  }
}
