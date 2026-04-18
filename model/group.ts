import mongoose from 'mongoose';

const GroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  members: [{
    type: String, // usernames
  }],
  admin: {
    type: String, // username
    required: true,
  },
  dp: {
    type: String,
    default: '',
  }
}, {
  timestamps: true,
});

export default mongoose.models.Group || mongoose.model('Group', GroupSchema);
