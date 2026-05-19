import mongoose, { Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole =
  | 'farmer'
  | 'buyer'
  | 'cooperative'
  | 'logistics'
  | 'warehouse'
  | 'investor'
  | 'admin'
  | 'supplier'
  | 'agent';

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: UserRole;
  organizationName?: string;
  metadata?: Record<string, unknown>;
  status: string;
  approved: boolean;
  resetToken?: string | null;
  resetTokenExpiry?: Date | null;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: ['farmer', 'buyer', 'cooperative', 'logistics', 'warehouse', 'investor', 'admin', 'supplier', 'agent'],
      default: 'buyer',
    },
    organizationName: { type: String, trim: true },
    metadata: { type: mongoose.Schema.Types.Mixed },
    status: { type: String, default: 'active' },
    approved: { type: Boolean, default: false },
    resetToken: { type: String, default: null, select: false },
    resetTokenExpiry: { type: Date, default: null, select: false },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser>('User', UserSchema);

export default User;
