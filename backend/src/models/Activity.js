import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    action: { type: String, required: true },
    target: { type: String, required: true },
    type: {
      type: String,
      enum: ['created', 'updated', 'commented', 'uploaded', 'assigned', 'completed', 'moved', 'deleted'],
      default: 'updated',
    },
  },
  { timestamps: true },
);

export const Activity = mongoose.model('Activity', activitySchema);
