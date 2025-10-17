import mongoose from 'mongoose';

export const PostSchema = new mongoose.Schema({
  userId: String,
  content: String,
  timestamp: { type: Date, default: Date.now },
  flagged: { type: Boolean, default: false },
});

export default mongoose.model('Post', PostSchema);
