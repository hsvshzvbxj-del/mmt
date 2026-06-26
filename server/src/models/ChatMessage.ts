import mongoose, { Schema, Document } from 'mongoose';

export interface IReadReceipt {
  userId: mongoose.Types.ObjectId;
  readAt: Date;
}

export interface IReaction {
  userId: mongoose.Types.ObjectId;
  emoji: string;
}

export interface IChatMessage extends Document {
  content: string;
  authorId: mongoose.Types.ObjectId;
  room: string;
  replyToId?: mongoose.Types.ObjectId;
  readBy: IReadReceipt[];
  reactions: IReaction[];
  visibleTo?: mongoose.Types.ObjectId[];
  isDeleted: boolean;
  deletedAt?: Date;
  type: 'text' | 'system';
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>({
  content: { type: String, required: true, maxlength: 2000 },
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  room: { type: String, default: 'general' },
  replyToId: { type: Schema.Types.ObjectId, ref: 'ChatMessage', default: null },
  readBy: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    readAt: { type: Date, default: Date.now },
  }],
  reactions: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    emoji: { type: String, maxlength: 8 },
  }],
  visibleTo: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
  type: { type: String, enum: ['text', 'system'], default: 'text' },
}, { timestamps: true });

ChatMessageSchema.index({ room: 1, createdAt: -1 });
ChatMessageSchema.index({ 'readBy.userId': 1 });

export const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);
