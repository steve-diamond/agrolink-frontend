const mongoose = require("mongoose");

const investmentSchema = new mongoose.Schema(
  {
    investor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    campaign_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FarmCampaign",
      required: true,
    },
    amount_invested: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      enum: ["NGN", "USD"],
      required: true,
    },
    expected_return: {
      type: Number,
      required: true,
    },
    actual_return: {
      type: Number,
    },
    investment_date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    maturity_date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "matured", "defaulted"],
      required: true,
    },
    payment_reference: {
      type: String,
      required: true,
    },
  },
  { timestamps: false }
);

module.exports = mongoose.model("Investment", investmentSchema);
