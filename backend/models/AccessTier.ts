import mongoose from 'mongoose';

const AccessTierSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  paymentAmount: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  profitShare: { type: Number, required: true }, // e.g., 1.0 = 100%
  tier: { type: String, enum: ['founder-100', 'early-100', 'standard-95', 'support-85', 'adult-80'], required: true },
});

export const AccessTier = mongoose.model('AccessTier', AccessTierSchema);
