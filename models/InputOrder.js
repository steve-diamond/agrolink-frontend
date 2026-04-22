const mongoose = require("mongoose");

const inputOrderSchema = new mongoose.Schema(
  {
    buyer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InputProduct",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    total_price: {
      type: Number,
      required: true,
    },
    delivery_address: {
      type: String,
    },
    payment_status: {
      type: String,
    },
    order_status: {
      type: String,
    },
    created_at: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  { timestamps: false }
);

module.exports = mongoose.model("InputOrder", inputOrderSchema);
