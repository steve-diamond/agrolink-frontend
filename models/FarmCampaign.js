const mongoose = require("mongoose");

const farmCampaignSchema = new mongoose.Schema(
  {
    farmer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    crop_type: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    farm_size_ha: {
      type: Number,
      required: true,
    },
    target_amount: {
      type: Number,
      required: true,
    },
    raised_amount: {
      type: Number,
      default: 0,
    },
    min_investment: {
      type: Number,
      required: true,
    },
    expected_return_pct: {
      type: Number,
      required: true,
    },
    duration_months: {
      type: Number,
      required: true,
    },
    start_date: {
      type: Date,
      required: true,
    },
    harvest_date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "active", "funded", "harvested", "closed"],
      required: true,
    },
    cover_image_url: {
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

module.exports = mongoose.model("FarmCampaign", farmCampaignSchema);
