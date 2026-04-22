const mongoose = require("mongoose");

const commodityPriceSchema = new mongoose.Schema(
  {
    commodity_name: {
      type: String,
      required: true,
    },
    price_per_kg: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      default: "kg",
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    lga: {
      type: String,
    },
    price_change_pct: {
      type: Number,
    },
    updated_at: {
      type: Date,
      default: Date.now,
      required: true,
    },
    trend: {
      type: String,
      enum: ["up", "down", "stable"],
      required: true,
    },
  },
  { timestamps: false }
);

module.exports = mongoose.model("CommodityPrice", commodityPriceSchema);
