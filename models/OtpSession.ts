import mongoose, { Document, Model } from 'mongoose';

export interface IOtpSession extends Document {
  phone: string;
  ref: string;
  otpHash: string;
  attempts: number;
  expiresAt: Date;
}

const OtpSessionSchema = new mongoose.Schema<IOtpSession>({
  phone:    { type: String, required: true, index: true },
  ref:      { type: String, required: true, unique: true },
  otpHash:  { type: String, required: true },
  attempts: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
});

const OtpSession: Model<IOtpSession> =
  (mongoose.models.OtpSession as Model<IOtpSession>) ||
  mongoose.model<IOtpSession>('OtpSession', OtpSessionSchema);

export default OtpSession;
