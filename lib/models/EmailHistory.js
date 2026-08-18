import mongoose from 'mongoose';

const EmailHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      index: true,
      default: null, // null for records created before auth was added
    },
    original_email: {
      type: String,
      required: true,
    },
    generated_reply: {
      type: String,
      required: true,
    },
    tone: {
      type: String,
      required: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

export default mongoose.models.EmailHistory ||
  mongoose.model('EmailHistory', EmailHistorySchema);
