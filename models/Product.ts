import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  price: number;
  quantity: number;
  category?: string;
  location: string;
  description?: string;
  imageUrl?: string;
  farmer: mongoose.Types.ObjectId;
  approved: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 0 },
    category: { type: String, default: '', trim: true },
    location: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    imageUrl: { type: String, default: '', trim: true },
    farmer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    approved: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Product: Model<IProduct> =
  (mongoose.models.Product as Model<IProduct>) ||
  mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
