const mongoose = require("mongoose");

const insuranceApplicationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    plan: {
      type: String,
      enum: ["basic", "standard", "premium"],
      required: true,
    },
    crop_type: {
      type: String,
      required: true,
    },
    farm_size_ha: {
      type: Number,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    lga: {
      type: String,
    },
    planting_date: {
      type: Date,
      required: true,
    },
    harvest_date: {
      type: Date,
      required: true,
    },
    premium_amount: {
      type: Number,
      required: true,
    },
    coverage_amount: {
      type: Number,
      required: true,
    },
    bank_name: {
      type: String,
      required: true,
    },
    account_number: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "active", "claimed", "expired"],
      default: "pending",
      required: true,
    },
    policy_number: {
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

module.exports = mongoose.model("InsuranceApplication", insuranceApplicationSchema);
