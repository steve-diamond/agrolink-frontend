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
      trim: true,
      lowercase: true,
    },
    grade: {
      type: String,
      enum: ["A", "B", "C"],
      required: true,
    },
    criteria_met: {
      type: Object,
      required: true,
      default: {},
    },
    photos: {
      type: [String],
      required: true,
      default: [],
    },
    grade_badge_url: {
      type: String,
      required: true,
      trim: true,
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

produceGradeSchema.index({ farmer_id: 1, created_at: -1 });
produceGradeSchema.index({ commodity: 1, grade: 1, created_at: -1 });
produceGradeSchema.index({ listing_id: 1 }, { sparse: true });
produceGradeSchema.index({ agent_id: 1, verified_by_agent: 1 }, { sparse: true });

produceGradeSchema.pre("save", function normalizeProduceGrade(next) {
  if (this.commodity) this.commodity = this.commodity.trim().toLowerCase();
  if (this.grade_badge_url) this.grade_badge_url = this.grade_badge_url.trim();
  if (Array.isArray(this.photos)) {
    this.photos = this.photos.filter(Boolean).map((url) => String(url).trim());
  }
  next();
});

module.exports = mongoose.models.ProduceGrade || mongoose.model("ProduceGrade", produceGradeSchema);
