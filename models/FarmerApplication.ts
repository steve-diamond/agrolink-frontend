import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IFarmerApplication extends Document {
  applicationId?: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'queued';
  account: { name: string; email: string; phone: string };
  application: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const FarmerApplicationSchema = new Schema<IFarmerApplication>(
  {
    applicationId: { type: String, index: true },
    status: {
      type: String,
      enum: ['draft', 'pending', 'approved', 'rejected', 'queued'],
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

const FarmerApplication: Model<IFarmerApplication> =
  (mongoose.models.FarmerApplication as Model<IFarmerApplication>) ||
  mongoose.model<IFarmerApplication>('FarmerApplication', FarmerApplicationSchema);

export default FarmerApplication;
