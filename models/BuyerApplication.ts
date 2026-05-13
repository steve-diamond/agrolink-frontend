import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IBuyerApplication extends Document {
  applicationId?: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'activation_completed' | 'queued';
  account: { name: string; email: string; phone: string };
  application: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const BuyerApplicationSchema = new Schema<IBuyerApplication>(
  {
    applicationId: { type: String, index: true },
    status: {
      type: String,
      enum: ['draft', 'pending', 'approved', 'rejected', 'activation_completed', 'queued'],
      default: 'pending',
    },
    account: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true },
      phone: { type: String, required: true, trim: true },
    },
    application: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

const BuyerApplication: Model<IBuyerApplication> =
  (mongoose.models.BuyerApplication as Model<IBuyerApplication>) ||
  mongoose.model<IBuyerApplication>('BuyerApplication', BuyerApplicationSchema);

export default BuyerApplication;
