import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description?: string;
  location?: string;
  eventDate: Date;
  seats: number;
  zoomLink?: string;
  imageUrl?: string;
  createdBy: mongoose.Types.ObjectId;
  isOnline: boolean;
  registrations: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>({
  title: { type: String, required: true },
  description: String,
  location: String,
  eventDate: { type: Date, required: true },
  seats: { type: Number, default: 0 },
  zoomLink: String,
  imageUrl: String,
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  isOnline: { type: Boolean, default: false },
  registrations: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

export const Event = mongoose.model<IEvent>('Event', EventSchema);
