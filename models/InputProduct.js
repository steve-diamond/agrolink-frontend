const mongoose = require("mongoose");

const inputProductSchema = new mongoose.Schema(
  {
    seller_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["seeds", "fertiliser", "agrochemical", "equipment", "other"],
      required: true,
    },
    brand: {
      type: String,
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
    created_at: {
      type: Date,
      default: Date.now,
      required: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: false }
);

module.exports = mongoose.model("InputProduct", inputProductSchema);
