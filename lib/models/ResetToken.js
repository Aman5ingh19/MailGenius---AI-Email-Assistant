import mongoose from 'mongoose';

const ResetTokenSchema = new mongoose.Schema({
  email: { type: String, required: true },
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 3600 }, // Auto-delete document after 1 hour (3600 seconds)
});

export default mongoose.models.ResetToken || mongoose.model('ResetToken', ResetTokenSchema);
