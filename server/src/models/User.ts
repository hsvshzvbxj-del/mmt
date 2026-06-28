import mongoose, { Schema, Document } from 'mongoose';

export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'moderator'
  | 'senior_moderator'
  | 'editor'
  | 'reviewer'
  | 'support'
  | 'member'
  | 'guest';

export type UserStatus =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'suspended'
  | 'banned'
  | 'muted'
  | 'archived';

export interface IBanInfo {
  isBanned: boolean;
  banType?: 'permanent' | 'temporary' | 'shadow' | 'soft';
  reason?: string;
  bannedBy?: mongoose.Types.ObjectId;
  bannedAt?: Date;
  expiresAt?: Date;
  appealText?: string;
  appealStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  history: Array<{
    banType: string;
    reason: string;
    bannedBy: mongoose.Types.ObjectId;
    bannedAt: Date;
    expiresAt?: Date;
    unbannedAt?: Date;
    unbannedBy?: mongoose.Types.ObjectId;
  }>;
}

export interface IMuteInfo {
  isMuted: boolean;
  reason?: string;
  mutedBy?: mongoose.Types.ObjectId;
  mutedAt?: Date;
  expiresAt?: Date;
}

export interface IOnboarding {
  completed: boolean;
  step: number;
  completedAt?: Date;
  interests?: string[];
  country?: string;
  language?: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  city?: string;
  country?: string;
  language?: string;
  specialization?: string;
  experience?: string;
  industry?: string;
  company?: string;
  linkedin?: string;
  bio?: string;
  website?: string;
  skills?: string[];
  interests?: string[];
  avatarUrl?: string;
  coverUrl?: string;
  profileTheme?: string;
  role: UserRole;
  status: UserStatus;
  banInfo: IBanInfo;
  muteInfo: IMuteInfo;
  onboarding: IOnboarding;
  lastActiveAt?: Date;
  loginCount: number;
  blockedUsers: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const BanHistorySchema = new Schema({
  banType: String,
  reason: String,
  bannedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  bannedAt: Date,
  expiresAt: Date,
  unbannedAt: Date,
  unbannedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { _id: false });

const BanInfoSchema = new Schema<IBanInfo>({
  isBanned: { type: Boolean, default: false },
  banType: { type: String, enum: ['permanent', 'temporary', 'shadow', 'soft'] },
  reason: String,
  bannedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  bannedAt: Date,
  expiresAt: Date,
  appealText: String,
  appealStatus: { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'none' },
  history: [BanHistorySchema],
}, { _id: false });

const MuteInfoSchema = new Schema<IMuteInfo>({
  isMuted: { type: Boolean, default: false },
  reason: String,
  mutedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  mutedAt: Date,
  expiresAt: Date,
}, { _id: false });

const OnboardingSchema = new Schema<IOnboarding>({
  completed: { type: Boolean, default: false },
  step: { type: Number, default: 0 },
  completedAt: Date,
  interests: [String],
  country: String,
  language: String,
}, { _id: false });

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  passwordHash: { type: String, required: true },
  phone: String,
  city: String,
  country: String,
  language: { type: String, default: 'ar' },
  specialization: String,
  experience: String,
  industry: String,
  company: String,
  linkedin: String,
  bio: String,
  website: String,
  skills: [String],
  interests: [String],
  avatarUrl: String,
  coverUrl: String,
  profileTheme: { type: String, default: 'blue' },
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'moderator', 'senior_moderator', 'editor', 'reviewer', 'support', 'member', 'guest'],
    default: 'member',
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'suspended', 'banned', 'muted', 'archived'],
    default: 'active',
  },
  banInfo: { type: BanInfoSchema, default: () => ({ isBanned: false, history: [], appealStatus: 'none' }) },
  muteInfo: { type: MuteInfoSchema, default: () => ({ isMuted: false }) },
  onboarding: { type: OnboardingSchema, default: () => ({ completed: false, step: 0 }) },
  lastActiveAt: Date,
  loginCount: { type: Number, default: 0 },
  blockedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

UserSchema.index({ email: 1 });
UserSchema.index({ role: 1, status: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ 'banInfo.expiresAt': 1 });
UserSchema.index({ 'muteInfo.expiresAt': 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
