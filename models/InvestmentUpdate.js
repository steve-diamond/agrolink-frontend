const mongoose = require("mongoose");

const investmentUpdateSchema = new mongoose.Schema(
  {
    campaign_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FarmCampaign",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 140,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 5000,
    },
    photo_urls: {
      type: [String],
      default: [],
      set: (urls) => (Array.isArray(urls) ? urls.filter(Boolean).map((url) => String(url).trim()) : []),
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

investmentUpdateSchema.index({ campaign_id: 1, created_at: -1 });

module.exports = mongoose.models.InvestmentUpdate || mongoose.model("InvestmentUpdate", investmentUpdateSchema);
