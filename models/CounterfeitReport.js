const mongoose = require("mongoose");

const counterfeitReportSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InputProduct",
      required: true,
    },
    reporter_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reason: {
      type: String,
      required: true,
    },
    evidence_url: {
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

module.exports = mongoose.model("CounterfeitReport", counterfeitReportSchema);
