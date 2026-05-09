import { model, models, Schema } from 'mongoose';

const inputProductSchema = new Schema(
  {
    seller_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    price_per_unit: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    quantity_available: {
      type: Number,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    delivery_available: {
      type: Boolean,
      default: false,
    },
    image_url: {
      type: String,
    },
    is_nafdac_approved: {
      type: Boolean,
      default: false,
    },
    nafdac_number: {
      type: String,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  { timestamps: false }
);

const InputProduct = models.InputProduct || model('InputProduct', inputProductSchema);

export default InputProduct;
