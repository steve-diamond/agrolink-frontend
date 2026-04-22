const mongoose = require("mongoose");

const produceGradeSchema = new mongoose.Schema(
  {
    listing_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
    },
    farmer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farmer",
      required: true,
    },
    commodity: {
      type: String,
      required: true,
    },
    grade: {
      type: String,
      enum: ["A", "B", "C"],
      required: true,
    },
    criteria_met: {
      type: Object,
      required: true,
    },
    photos: {
      type: [String],
      required: true,
    },
    grade_badge_url: {
      type: String,
      required: true,
    },
    verified_by_agent: {
      type: Boolean,
      default: false,
    },
    agent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

module.exports = mongoose.model("ProduceGrade", produceGradeSchema);
