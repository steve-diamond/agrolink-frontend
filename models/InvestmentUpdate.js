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
    },
    body: {
      type: String,
      required: true,
    },
    photo_urls: {
      type: [String],
    },
    created_at: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  { timestamps: false }
);

module.exports = mongoose.model("InvestmentUpdate", investmentUpdateSchema);
