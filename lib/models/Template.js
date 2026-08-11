import mongoose from 'mongoose';

const TemplateSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
    },
    reply_text: {
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

export default mongoose.models.Template ||
  mongoose.model('Template', TemplateSchema);
