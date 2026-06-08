const mongoose = require("mongoose");

const cooperativeMemberSchema = new mongoose.Schema(
  {
    cooperative_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cooperative",
      required: true,
    },
    farmer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["member", "admin"],
      required: true,
    },
    joined_at: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

cooperativeMemberSchema.index({ cooperative_id: 1, farmer_id: 1 }, { unique: true });
cooperativeMemberSchema.index({ farmer_id: 1, role: 1 });
cooperativeMemberSchema.index({ cooperative_id: 1, createdAt: -1 });

module.exports = mongoose.model("CooperativeMember", cooperativeMemberSchema);
