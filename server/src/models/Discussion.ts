import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDiscussion extends Document {
  title: string;
  content: string;
  tags: string[];
  authorId: mongoose.Types.ObjectId;
  likesCount: number;
  likes: mongoose.Types.ObjectId[];
  saves: mongoose.Types.ObjectId[];
  isPinned: boolean;
  comments: IComment[];
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>({
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
}, { timestamps: true });

const DiscussionSchema = new Schema<IDiscussion>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  tags: [String],
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  likesCount: { type: Number, default: 0 },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  saves: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  isPinned: { type: Boolean, default: false },
  comments: [CommentSchema],
}, { timestamps: true });

export const Discussion = mongoose.model<IDiscussion>('Discussion', DiscussionSchema);
