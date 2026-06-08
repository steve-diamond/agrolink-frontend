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
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

cooperativeSchema.index({ cac_reg_number: 1 }, { unique: true });
cooperativeSchema.index({ status: 1, createdAt: -1 });
cooperativeSchema.index({ state: 1, primary_commodity: 1 });

cooperativeSchema.pre("save", function normalizeCooperative(next) {
  if (this.name) this.name = this.name.trim();
  if (this.state) this.state = this.state.trim();
  if (this.lga) this.lga = this.lga.trim();
  if (this.primary_commodity) this.primary_commodity = this.primary_commodity.trim();
  if (this.chairman_email) this.chairman_email = this.chairman_email.toLowerCase().trim();
  if (this.secretary_email) this.secretary_email = this.secretary_email.toLowerCase().trim();
  next();
});

module.exports = mongoose.model("Cooperative", cooperativeSchema);
