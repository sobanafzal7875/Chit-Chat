import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true,
  },
  receiver: {
    type: String,
    // Required only for direct messages
    required: false,
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: false,
  },
  content: {
    type: String,
    required: false, // Can be empty if it's a file
  },
  fileUrl: {
    type: String,
    required: false,
  },
  fileType: {
    type: String,
    required: false,
  },
  read: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Message || mongoose.model('Message', MessageSchema);
