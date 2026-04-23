import mongoose, { Schema, Document } from 'mongoose';

export interface IWhatsAppSession extends Document {
  phone_number: string;
  current_menu: string;
  context: Record<string, unknown>;
  last_active: Date;
}

const WhatsAppSessionSchema = new Schema<IWhatsAppSession>({
  phone_number: { type: String, required: true, unique: true },
  current_menu: { type: String, required: true },
  context: { type: Schema.Types.Mixed, default: {} },
  last_active: { type: Date, default: Date.now },
});

export default mongoose.models.WhatsAppSession || mongoose.model<IWhatsAppSession>('WhatsAppSession', WhatsAppSessionSchema);
