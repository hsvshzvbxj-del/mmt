import mongoose, { Schema, Document } from 'mongoose';

export interface IMembershipRequest extends Document {
  fullName: string;
  email: string;
  phone?: string;
  city?: string;
  specialization?: string;
  company?: string;
  experience?: string;
  industry?: string;
  contribution?: string;
  source?: string;
  linkedin?: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MembershipRequestSchema = new Schema<IMembershipRequest>({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  city: String,
  specialization: String,
  company: String,
  experience: String,
  industry: String,
  contribution: String,
  source: String,
  linkedin: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  notes: String,
}, { timestamps: true });

export const MembershipRequest = mongoose.model<IMembershipRequest>('MembershipRequest', MembershipRequestSchema);
