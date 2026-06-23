import mongoose, { Schema, Document } from 'mongoose';

export interface IOpportunity extends Document {
  title: string;
  description?: string;
  company?: string;
  type: 'job' | 'project' | 'consulting' | 'partnership';
  deadline?: Date;
  status: 'active' | 'closed' | 'pending';
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const OpportunitySchema = new Schema<IOpportunity>({
  title: { type: String, required: true },
  description: String,
  company: String,
  type: { type: String, enum: ['job', 'project', 'consulting', 'partnership'] },
  deadline: Date,
  status: { type: String, enum: ['active', 'closed', 'pending'], default: 'active' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export const Opportunity = mongoose.model<IOpportunity>('Opportunity', OpportunitySchema);
