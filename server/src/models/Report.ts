import mongoose, { Schema, Document } from 'mongoose';

export type ReportType = 'spam' | 'harassment' | 'hate_speech' | 'misinformation' | 'inappropriate' | 'other';
export type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed';
export type ReportTarget = 'user' | 'discussion' | 'comment' | 'article' | 'message' | 'opportunity';

export interface IReport extends Document {
  reportedBy: mongoose.Types.ObjectId;
  targetType: ReportTarget;
  targetId: string;
  targetUser?: mongoose.Types.ObjectId;
  type: ReportType;
  description?: string;
  status: ReportStatus;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewNotes?: string;
  resolvedAt?: Date;
  action?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>({
  reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  targetType: { type: String, enum: ['user', 'discussion', 'comment', 'article', 'message', 'opportunity'], required: true },
  targetId: { type: String, required: true },
  targetUser: { type: Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['spam', 'harassment', 'hate_speech', 'misinformation', 'inappropriate', 'other'], required: true },
  description: String,
  status: { type: String, enum: ['pending', 'reviewing', 'resolved', 'dismissed'], default: 'pending' },
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  reviewNotes: String,
  resolvedAt: Date,
  action: String,
}, { timestamps: true });

ReportSchema.index({ status: 1, createdAt: -1 });
ReportSchema.index({ reportedBy: 1 });
ReportSchema.index({ targetUser: 1 });

export const Report = mongoose.model<IReport>('Report', ReportSchema);
