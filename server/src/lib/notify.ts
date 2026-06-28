import mongoose from 'mongoose';
import { Notification, NotificationType } from '../models/Notification';

interface NotifyOptions {
  userId: string | mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  icon?: string;
  triggeredBy?: string | mongoose.Types.ObjectId;
  resourceId?: string;
  resourceType?: string;
}

export async function notify(opts: NotifyOptions) {
  try {
    // لا ترسل إشعاراً للمستخدم عن نفسه
    if (opts.triggeredBy && opts.triggeredBy.toString() === opts.userId.toString()) return;

    await Notification.create({
      userId: opts.userId,
      type: opts.type,
      title: opts.title,
      body: opts.body,
      link: opts.link,
      icon: opts.icon,
      triggeredBy: opts.triggeredBy,
      resourceId: opts.resourceId,
      resourceType: opts.resourceType,
    });
  } catch (err) {
    console.error('notify error:', err);
  }
}

export async function notifyMany(userIds: (string | mongoose.Types.ObjectId)[], opts: Omit<NotifyOptions, 'userId'>) {
  try {
    const docs = userIds
      .filter(uid => uid.toString() !== opts.triggeredBy?.toString())
      .map(uid => ({
        userId: uid,
        type: opts.type,
        title: opts.title,
        body: opts.body,
        link: opts.link,
        icon: opts.icon,
        triggeredBy: opts.triggeredBy,
        resourceId: opts.resourceId,
        resourceType: opts.resourceType,
      }));

    if (docs.length) await Notification.insertMany(docs);
  } catch (err) {
    console.error('notifyMany error:', err);
  }
}
