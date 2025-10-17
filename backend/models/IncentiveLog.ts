import mongoose from 'mongoose';

const IncentiveLogSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  role: { type: String, enum: ['founder', 'influencer', 'support'], required: true },
  action: { type: String, enum: ['onboarded', 'referred', 'milestone'], required: true },
  targetId: { type: String }, // e.g., referred user
  reward: { type: Number }, // e.g., bonus amount or % boost
  timestamp: { type: Date, default: Date.now },
});

export const IncentiveLog = mongoose.model('IncentiveLog', IncentiveLogSchema);
