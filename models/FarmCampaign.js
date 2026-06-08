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
      trim: true,
      minlength: 3,
      maxlength: 140,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
      maxlength: 4000,
    },
    crop_type: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    farm_size_ha: {
      type: Number,
      required: true,
      min: 0.01,
    },
    target_amount: {
      type: Number,
      required: true,
      min: 1,
    },
    raised_amount: {
      type: Number,
      default: 0,
      min: 0,
    },
    min_investment: {
      type: Number,
      required: true,
      min: 1,
    },
    expected_return_pct: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    duration_months: {
      type: Number,
      required: true,
      min: 1,
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
      default: "draft",
    },
    cover_image_url: {
      type: String,
      trim: true,
      default: "",
    },
    created_at: {
      type: Date,
      default: Date.now,
      required: true,
      immutable: true,
    },
  },
  { timestamps: false }
);

farmCampaignSchema.index({ farmer_id: 1, status: 1, created_at: -1 });
farmCampaignSchema.index({ status: 1, created_at: -1 });

module.exports = mongoose.models.FarmCampaign || mongoose.model("FarmCampaign", farmCampaignSchema);
