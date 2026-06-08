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
      min: 1,
    },
    currency: {
      type: String,
      enum: ["NGN", "USD"],
      required: true,
      uppercase: true,
      trim: true,
    },
    expected_return: {
      type: Number,
      required: true,
      min: 0,
    },
    actual_return: {
      type: Number,
      min: 0,
    },
    investment_date: {
      type: Date,
      default: Date.now,
      required: true,
      immutable: true,
    },
    maturity_date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "matured", "defaulted"],
      required: true,
      default: "active",
    },
    payment_reference: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: false }
);

investmentSchema.index({ investor_id: 1, status: 1, investment_date: -1 });
investmentSchema.index({ campaign_id: 1, status: 1 });
investmentSchema.index({ payment_reference: 1 }, { unique: true });

module.exports = mongoose.models.Investment || mongoose.model("Investment", investmentSchema);
