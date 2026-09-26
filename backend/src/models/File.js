import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    originalName: { type: String, required: true },
    type: { type: String, default: 'application/octet-stream' },
    size: { type: Number, default: 0 },
    path: { type: String, required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

fileSchema.index({ name: 'text', originalName: 'text' });

export const File = mongoose.model('File', fileSchema);
