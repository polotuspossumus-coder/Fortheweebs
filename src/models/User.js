import mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  license: { type: String, default: 'Custom' },
  banned: { type: Boolean, default: false },
  log: [String],
});

export default mongoose.model('User', UserSchema);
