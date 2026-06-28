import mongoose, { Schema, Document } from 'mongoose';

export type NotificationType =
  | 'message'       // رسالة خاصة جديدة
  | 'mention'       // ذُكرت في نقاش
  | 'reply'         // رد على نقاشك
  | 'like'          // إعجاب بمنشورك
  | 'event'         // فعالية جديدة
  | 'opportunity'   // فرصة جديدة
  | 'article'       // مقال جديد
  | 'application'   // طلب عضوية (للمشرفين)
  | 'report'        // بلاغ جديد (للمشرفين)
  | 'ban'           // تم حظرك
  | 'unban'         // رفع الحظر
  | 'mute'          // تم كتمك
  | 'role_change'   // تغيير الدور
  | 'welcome'       // رسالة ترحيب
  | 'system';       // رسالة نظام

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;          // المستقبِل
  type: NotificationType;
  title: string;
  body: string;
  link?: string;                            // الرابط عند الضغط
  icon?: string;                            // صورة المرسِل
  isRead: boolean;
  readAt?: Date;
  triggeredBy?: mongoose.Types.ObjectId;   // من أطلق الإشعار
  resourceId?: string;                     // مثلاً ID النقاش أو الرسالة
  resourceType?: string;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId:      { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type:        { type: String, required: true },
  title:       { type: String, required: true, maxlength: 200 },
  body:        { type: String, required: true, maxlength: 500 },
  link:        String,
  icon:        String,
  isRead:      { type: Boolean, default: false, index: true },
  readAt:      Date,
  triggeredBy: { type: Schema.Types.ObjectId, ref: 'User' },
  resourceId:  String,
  resourceType: String,
}, { timestamps: true, versionKey: false });

NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, isRead: 1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
