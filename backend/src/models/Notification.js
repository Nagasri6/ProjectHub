import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    body: { type: String, default: '' },
    read: { type: Boolean, default: false },
    type: { type: String, default: 'info' },
    link: { type: String, default: '' },
  },
  { timestamps: true },
);

export const Notification = mongoose.model('Notification', notificationSchema);
