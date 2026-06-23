import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  city?: string;
  specialization?: string;
  experience?: string;
  industry?: string;
  company?: string;
  linkedin?: string;
  bio?: string;
  website?: string;
  skills?: string[];
  avatarUrl?: string;
  role: 'member' | 'moderator' | 'admin';
  status: 'active' | 'suspended' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  phone: String,
  city: String,
  specialization: String,
  experience: String,
  industry: String,
  company: String,
  linkedin: String,
  bio: String,
  website: String,
  skills: [String],
  avatarUrl: String,
  role: { type: String, enum: ['member', 'moderator', 'admin'], default: 'member' },
  status: { type: String, enum: ['active', 'suspended', 'inactive'], default: 'active' },
}, { timestamps: true });

export const User = mongoose.model<IUser>('User', UserSchema);
