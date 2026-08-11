'use server';

import connectDB from '@/lib/mongodb';
import EmailHistory from '@/lib/models/EmailHistory';
import Template from '@/lib/models/Template';
import mongoose from 'mongoose';

// ─── Email History ────────────────────────────────────────────────────────────

export async function getHistory() {
  await connectDB();
  const history = await EmailHistory.find({})
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
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid ID');
  }
  await EmailHistory.findByIdAndDelete(id);
}

// ─── Templates ────────────────────────────────────────────────────────────────

export async function getTemplates() {
  await connectDB();
  const templates = await Template.find({})
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
  const template = await Template.create({
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
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid ID');
  }
  await Template.findByIdAndDelete(id);
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export async function getDashboardStats() {
  await connectDB();
  const totalReplies = await EmailHistory.countDocuments();
  const mostRecent = await EmailHistory.findOne({})
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
