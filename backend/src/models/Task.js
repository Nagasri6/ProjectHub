import mongoose from 'mongoose';

const subtaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    done: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['To Do', 'In Progress', 'Review', 'Done'],
      default: 'To Do',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    dueDate: { type: Date },
    startDate: { type: Date },
    labels: [{ type: String }],
    subtasks: [subtaskSchema],
    attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
    order: { type: Number, default: 0 },
    phase: { type: String, default: '' },
  },
  { timestamps: true },
);

taskSchema.index({ title: 'text', description: 'text' });

export const Task = mongoose.model('Task', taskSchema);
