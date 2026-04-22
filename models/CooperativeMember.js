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
  { timestamps: false }
);

module.exports = mongoose.model("CooperativeMember", cooperativeMemberSchema);
