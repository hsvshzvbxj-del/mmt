import mongoose, { Schema, Document } from 'mongoose';

export type AuditAction =
  | 'user.login' | 'user.logout' | 'user.register' | 'user.update' | 'user.delete'
  | 'user.ban' | 'user.unban' | 'user.mute' | 'user.unmute' | 'user.suspend'
  | 'user.role_change' | 'user.status_change' | 'user.password_change'
  | 'member.approve' | 'member.reject'
  | 'event.create' | 'event.update' | 'event.delete'
  | 'opportunity.create' | 'opportunity.update' | 'opportunity.delete'
  | 'discussion.create' | 'discussion.delete' | 'discussion.pin'
  | 'article.create' | 'article.update' | 'article.delete' | 'article.publish'
  | 'message.delete' | 'message.report'
  | 'report.create' | 'report.resolve'
  | 'admin.settings_change'
  | 'onboarding.complete';

export interface IAuditLog extends Document {
  action: AuditAction | string;
  performedBy: mongoose.Types.ObjectId;
  targetUser?: mongoose.Types.ObjectId;
  targetResource?: string;
  targetResourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  action: { type: String, required: true },
  performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  targetUser: { type: Schema.Types.ObjectId, ref: 'User' },
  targetResource: String,
  targetResourceId: String,
  details: { type: Schema.Types.Mixed },
  ipAddress: String,
  userAgent: String,
}, { timestamps: true, versionKey: false });

AuditLogSchema.index({ performedBy: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ targetUser: 1 });
AuditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
