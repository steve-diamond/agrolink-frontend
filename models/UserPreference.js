const mongoose = require("mongoose");

const userPreferenceSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    commodity: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    alert_enabled: {
      type: Boolean,
      default: false,
    },
    alert_threshold_pct: {
      type: Number,
      default: 10,
    },
    phone: {
      type: String,
    },
  },
  { timestamps: false }
);

userPreferenceSchema.index({ user_id: 1, commodity: 1, state: 1 }, { unique: true });

module.exports = mongoose.model("UserPreference", userPreferenceSchema);
