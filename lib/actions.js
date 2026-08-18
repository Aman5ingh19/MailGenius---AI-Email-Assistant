'use server';

import connectDB from '@/lib/mongodb';
import EmailHistory from '@/lib/models/EmailHistory';
import Template from '@/lib/models/Template';
import mongoose from 'mongoose';
import { auth } from '@/auth';

// ─── Helper: get current user ID ─────────────────────────────────────────────
async function getCurrentUserId() {
  const session = await auth();
  return session?.user?.id || null;
}

// ─── Email History ────────────────────────────────────────────────────────────

export async function getHistory() {
  await connectDB();
  const userId = await getCurrentUserId();
  const query = userId ? { userId } : { userId: null }; // show only own records
  const history = await EmailHistory.find(query)
    .sort({ created_at: -1 })
    .lean();
  return history.map((item) => ({
    ...item,
    _id: item._id.toString(),
    created_at: item.created_at?.toISOString() ?? null,
  }));
}

export async function deleteHistory(id) {
  await connectDB();
  const userId = await getCurrentUserId();
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid ID');
  }
  // Only delete if the record belongs to the current user
  await EmailHistory.findOneAndDelete({ _id: id, userId });
}

// ─── Templates ────────────────────────────────────────────────────────────────

export async function getTemplates() {
  await connectDB();
  const userId = await getCurrentUserId();
  const query = userId ? { userId } : { userId: null };
  const templates = await Template.find(query)
    .sort({ created_at: -1 })
    .lean();
  return templates.map((t) => ({
    ...t,
    _id: t._id.toString(),
    created_at: t.created_at?.toISOString() ?? null,
  }));
}

export async function saveTemplate(replyText, label) {
  await connectDB();
  const userId = await getCurrentUserId();
  const template = await Template.create({
    userId,
    label: label?.trim() || 'Untitled Template',
    reply_text: replyText,
    created_at: new Date(),
  });
  return {
    _id: template._id.toString(),
    label: template.label,
    reply_text: template.reply_text,
    created_at: template.created_at.toISOString(),
  };
}

export async function deleteTemplate(id) {
  await connectDB();
  const userId = await getCurrentUserId();
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid ID');
  }
  await Template.findOneAndDelete({ _id: id, userId });
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export async function getDashboardStats() {
  await connectDB();
  const userId = await getCurrentUserId();
  const query = userId ? { userId } : { userId: null };

  const totalReplies = await EmailHistory.countDocuments(query);
  const mostRecent = await EmailHistory.findOne(query)
    .sort({ created_at: -1 })
    .lean();

  return {
    totalReplies,
    mostRecent: mostRecent
      ? {
          ...mostRecent,
          _id: mostRecent._id.toString(),
          created_at: mostRecent.created_at?.toISOString() ?? null,
        }
      : null,
  };
}
