import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const settingsSchema = new mongoose.Schema(
  {
    emailNotifications: { type: Boolean, default: true },
    taskNotifications: { type: Boolean, default: true },
    projectNotifications: { type: Boolean, default: true },
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    timezone: { type: String, default: 'Asia/Kolkata' },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin', 'developer'], default: 'developer' },
    title: { type: String, default: 'Team Member' },
    avatar: { type: String, default: '' },
    status: { type: String, enum: ['active', 'away', 'offline'], default: 'active' },
    timezone: { type: String, default: 'Asia/Kolkata' },
    settings: { type: settingsSchema, default: () => ({}) },
  },
  { timestamps: true },
);

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toPublic = function toPublic() {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    role: this.role,
    title: this.title,
    avatar: this.avatar,
    status: this.status,
    timezone: this.timezone,
    settings: this.settings,
    createdAt: this.createdAt,
  };
};

export const User = mongoose.model('User', userSchema);
