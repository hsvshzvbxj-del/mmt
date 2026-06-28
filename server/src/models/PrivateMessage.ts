import mongoose, { Schema, Document } from 'mongoose';

export type MessageType = 'text' | 'image' | 'file' | 'voice' | 'system';
export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface IPrivateMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  content: string;
  type: MessageType;
  status: MessageStatus;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  replyToId?: mongoose.Types.ObjectId;
  readAt?: Date;
  isDeleted: boolean;
  deletedFor: mongoose.Types.ObjectId[];
  reactions: Array<{
    userId: mongoose.Types.ObjectId;
    emoji: string;
  }>;
  isStarred: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const PrivateMessageSchema = new Schema<IPrivateMessage>({
  conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, maxlength: 5000 },
  type: { type: String, enum: ['text', 'image', 'file', 'voice', 'system'], default: 'text' },
  status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
  fileUrl: String,
  fileName: String,
  fileSize: Number,
  replyToId: { type: Schema.Types.ObjectId, ref: 'PrivateMessage' },
  readAt: Date,
  isDeleted: { type: Boolean, default: false },
  deletedFor: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  reactions: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    emoji: { type: String, maxlength: 8 },
  }],
  isStarred: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

PrivateMessageSchema.index({ conversationId: 1, createdAt: -1 });
PrivateMessageSchema.index({ senderId: 1 });

export const PrivateMessage = mongoose.model<IPrivateMessage>('PrivateMessage', PrivateMessageSchema);
