import mongoose from 'mongoose';

const ValidatorLogSchema = new mongoose.Schema({
  creatorId: { type: String, required: true },
  action: { type: String, required: true }, // e.g., "remix", "drop", "fork", "onboard"
  timestamp: { type: Date, default: Date.now },
  metadata: { type: Object }, // e.g., remix lineage, slab ID, ritual context
});

export const ValidatorLog = mongoose.model('ValidatorLog', ValidatorLogSchema);
