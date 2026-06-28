import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  lastMessage?: string;
  lastMessageAt?: Date;
  lastMessageBy?: mongoose.Types.ObjectId;
  unreadCount: Map<string, number>;
  isArchived: Map<string, boolean>;
  isDeleted: Map<string, boolean>;
  isBlocked: boolean;
  blockedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>({
  participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  lastMessage: String,
  lastMessageAt: Date,
  lastMessageBy: { type: Schema.Types.ObjectId, ref: 'User' },
  unreadCount: { type: Map, of: Number, default: {} },
  isArchived: { type: Map, of: Boolean, default: {} },
  isDeleted: { type: Map, of: Boolean, default: {} },
  isBlocked: { type: Boolean, default: false },
  blockedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ lastMessageAt: -1 });

export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);
