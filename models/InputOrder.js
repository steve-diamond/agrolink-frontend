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
      trim: true,
      maxlength: 500,
    },
    payment_status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    order_status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    created_at: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

inputOrderSchema.index({ buyer_id: 1, createdAt: -1 });
inputOrderSchema.index({ product_id: 1, order_status: 1 });
inputOrderSchema.index({ payment_status: 1, createdAt: -1 });

inputOrderSchema.pre("save", function normalizeInputOrder(next) {
  if (this.delivery_address) this.delivery_address = this.delivery_address.trim();
  next();
});

module.exports = mongoose.model("InputOrder", inputOrderSchema);
