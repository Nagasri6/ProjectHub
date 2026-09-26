import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: { type: String, default: 'Product' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['Planning', 'In Progress', 'On Track', 'At Risk', 'Completed'],
      default: 'Planning',
    },
    startDate: { type: Date, required: true },
    targetDate: { type: Date, required: true },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    color: { type: String, default: '#6366F1' },
  },
  { timestamps: true },
);

projectSchema.index({ name: 'text', description: 'text' });

export const Project = mongoose.model('Project', projectSchema);
