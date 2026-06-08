import mongoose, { Document, Model, Schema } from 'mongoose';

interface IOrderProduct {
  productId: mongoose.Types.ObjectId;
  quantity: number;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  products: IOrderProduct[];
  totalAmount: number;
  commission: number;
  status: 'pending' | 'paid' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentReference?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const OrderProductSchema = new Schema<IOrderProduct>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    products: { type: [OrderProductSchema], required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    commission: { type: Number, required: true, min: 0, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'paid', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    paymentReference: { type: String, default: null },
  },
  { timestamps: true }
);

// Indexes for common query patterns
OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ paymentReference: 1 }, { sparse: true });

const Order: Model<IOrder> =
  (mongoose.models.Order as Model<IOrder>) ||
  mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
