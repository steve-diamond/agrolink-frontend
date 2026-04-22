const mongoose = require("mongoose");

const cooperativeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    cac_reg_number: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    lga: {
      type: String,
      required: true,
    },
    year_founded: {
      type: Number,
      required: true,
    },
    primary_commodity: {
      type: String,
      required: true,
    },
    member_count: {
      type: Number,
    },
    chairman_name: {
      type: String,
      required: true,
    },
    chairman_phone: {
      type: String,
      required: true,
    },
    chairman_email: {
      type: String,
      required: true,
    },
    secretary_name: {
      type: String,
      required: true,
    },
    secretary_phone: {
      type: String,
      required: true,
    },
    secretary_email: {
      type: String,
      required: true,
    },
    photo_url: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
      required: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  { timestamps: false }
);

module.exports = mongoose.model("Cooperative", cooperativeSchema);
