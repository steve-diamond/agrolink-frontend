import mongoose, { Schema, Document } from 'mongoose';

export interface IUserPreference extends Document {
  user_id: string;
  commodity: string;
  state: string;
  alert_enabled: boolean;
  alert_threshold_pct: number;
}

const UserPreferenceSchema = new Schema<IUserPreference>(
  {
    user_id: { type: String, required: true },
    commodity: { type: String },
    state: { type: String },
    alert_enabled: { type: Boolean, default: false },
    alert_threshold_pct: { type: Number, default: 5 },
  },
  { timestamps: true }
);

export default mongoose.models.UserPreference ||
  mongoose.model<IUserPreference>('UserPreference', UserPreferenceSchema);
