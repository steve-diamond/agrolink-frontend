import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInputProduct extends Document {
	name: string;
	category: string;
	price_per_unit: number;
	unit: string;
	quantity_available: number;
	state: string;
	is_active: boolean;
	is_nafdac_approved?: boolean;
	seller_id: string;
	created_at?: Date;
}

const InputProductSchema: Schema<IInputProduct> = new Schema({
	name: { type: String, required: true },
	category: { type: String, required: true },
	price_per_unit: { type: Number, required: true },
	unit: { type: String, required: true },
	quantity_available: { type: Number, required: true },
	state: { type: String, required: true },
	is_active: { type: Boolean, default: true },
	is_nafdac_approved: { type: Boolean, default: false },
	seller_id: { type: String, required: true },
	created_at: { type: Date, default: Date.now },
});

const InputProduct: Model<IInputProduct> =
	mongoose.models.InputProduct || mongoose.model<IInputProduct>('InputProduct', InputProductSchema);

export default InputProduct;
