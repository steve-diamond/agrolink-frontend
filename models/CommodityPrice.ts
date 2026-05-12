import mongoose, { Schema, Document } from 'mongoose';

export interface ICommodityPrice extends Document {
  commodity_name: string;
  state: string;
  price: number;
  unit: string;
  updated_at: Date;
  [key: string]: unknown;
}

const CommodityPriceSchema = new Schema<ICommodityPrice>(
  {
    commodity_name: { type: String, required: true },
    state: { type: String },
    price: { type: Number },
    unit: { type: String },
    updated_at: { type: Date, default: Date.now },
  },
  { strict: false, timestamps: true }
);

export default mongoose.models.CommodityPrice ||
  mongoose.model<ICommodityPrice>('CommodityPrice', CommodityPriceSchema);
