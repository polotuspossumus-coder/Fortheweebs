import mongoose from 'mongoose';

const ArtifactSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true }, // e.g., "ad-letter-jp"
  type: { type: String, enum: ['ad', 'onboarding', 'lore'], required: true },
  language: { type: String, required: true }, // e.g., "ja", "es", "fr"
  region: { type: String }, // e.g., "Japan", "Mexico"
  content: { type: String, required: true },
  createdBy: { type: String }, // validator ID
  createdAt: { type: Date, default: Date.now },
});

export const Artifact = mongoose.model('Artifact', ArtifactSchema);
