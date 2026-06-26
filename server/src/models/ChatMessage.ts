import mongoose, { Schema, Document } from 'mongoose';

export interface IChatMessage extends Document {
  content: string;
  authorId: mongoose.Types.ObjectId;
  room: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>({
  content: { type: String, required: true, maxlength: 2000 },
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  room: { type: String, default: 'general' },
}, { timestamps: true });

ChatMessageSchema.index({ room: 1, createdAt: -1 });

export const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);
