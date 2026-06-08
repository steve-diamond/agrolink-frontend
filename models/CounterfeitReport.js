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
      trim: true,
      minlength: 5,
      maxlength: 2000,
    },
    evidence_url: {
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

counterfeitReportSchema.index({ product_id: 1, created_at: -1 });
counterfeitReportSchema.index({ reporter_id: 1, created_at: -1 });

module.exports =
  mongoose.models.CounterfeitReport ||
  mongoose.model("CounterfeitReport", counterfeitReportSchema);
