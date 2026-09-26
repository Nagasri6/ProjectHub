import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Waiting', 'Resolved', 'Closed'],
      default: 'Open',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    dueDate: { type: Date },
  },
  { timestamps: true },
);

issueSchema.index({ title: 'text', description: 'text' });

export const Issue = mongoose.model('Issue', issueSchema);
