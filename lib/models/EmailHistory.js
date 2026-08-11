import mongoose from 'mongoose';

const EmailHistorySchema = new mongoose.Schema(
  {
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
      enum: ['formal', 'friendly', 'concise', 'persuasive'],
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
