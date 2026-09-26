import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    projectRole: {
      type: String,
      enum: ['Owner', 'Lead', 'Developer', 'Designer', 'QA', 'Viewer'],
      default: 'Developer',
    },
  },
  { timestamps: true },
);

teamMemberSchema.index({ project: 1, user: 1 }, { unique: true });

export const TeamMember = mongoose.model('TeamMember', teamMemberSchema);
