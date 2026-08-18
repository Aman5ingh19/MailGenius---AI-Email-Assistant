import { z } from 'zod';

// ─── Generate / Quick-Reply / Improve ────────────────────────────────────────
export const GenerateSchema = z.object({
  action: z.enum(['generate', 'improve', 'quick-replies']).default('generate'),
  originalEmail: z.string().max(20000).optional().default(''),
  draftReply: z.string().max(20000).optional().default(''),
  tone: z.enum(['formal', 'friendly', 'concise', 'persuasive']).optional().default('formal'),
  length: z.enum(['shorter', 'default', 'longer']).optional().default('default'),
  variations: z.coerce.number().int().min(1).max(3).optional().default(1),
  useEmojis: z.boolean().optional().default(false),
  inputLanguage: z.string().max(50).optional().default('Auto Detect'),
});

// ─── Inbox Draft ─────────────────────────────────────────────────────────────
export const DraftSchema = z.object({
  provider: z.enum(['outlook', 'microsoft-entra-id']),
  threadId: z.string().max(500).optional(),
  subject: z.string().max(500).optional().default(''),
  to: z.string().email({ message: 'Invalid recipient email address' }),
  replyBody: z.string().min(1, 'Reply body cannot be empty').max(50000),
});

// ─── Outlook Message Fetch ────────────────────────────────────────────────────
export const MessageIdSchema = z.object({
  messageId: z.string().min(1, 'messageId is required').max(500),
});

// ─── File Upload ──────────────────────────────────────────────────────────────
export const UploadSchema = z.object({
  text: z.string().min(1, 'Extracted text cannot be empty').max(20000),
});

// ─── User Avatar ──────────────────────────────────────────────────────────────
export const AvatarSchema = z.object({
  publicId: z.string().optional(),
});

// ─── Helper: parse and return formatted error ─────────────────────────────────
export function parseBody(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const messages = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
    return { success: false, error: messages, data: null };
  }
  return { success: true, error: null, data: result.data };
}
