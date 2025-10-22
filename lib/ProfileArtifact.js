import mongoose from "mongoose";

const ProfileArtifactSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  module: { type: String, required: true },
  artifact: { type: mongoose.Schema.Types.Mixed, required: true },
  timestamp: { type: Date, default: Date.now },
  legacySealed: { type: Boolean, default: false }
});

const ProfileArtifact = mongoose.model("ProfileArtifact", ProfileArtifactSchema);
export default ProfileArtifact;
