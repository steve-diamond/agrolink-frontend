import mongoose, { Schema, Document } from 'mongoose';

export interface IInsuranceApplication extends Document {
  plan: string;
  phone: string;
  premium_amount: number;
  coverage_amount: number;
  status: string;
  [key: string]: unknown;
}

const InsuranceApplicationSchema = new Schema<IInsuranceApplication>(
  {
    plan: { type: String, required: true },
    phone: { type: String },
    premium_amount: { type: Number },
    coverage_amount: { type: Number },
    status: { type: String, default: 'pending' },
  },
  { strict: false, timestamps: true }
);

export default mongoose.models.InsuranceApplication ||
  mongoose.model<IInsuranceApplication>('InsuranceApplication', InsuranceApplicationSchema);
