import mongoose, { Schema, Document } from 'mongoose';

export interface ISetting extends Document {
  key: string;
  value: any;
  group: string;
  updatedAt: Date;
}

const SettingSchema: Schema = new Schema({
  key: { type: String, required: true, unique: true, index: true },
  value: { type: Schema.Types.Mixed, required: true },
  group: { type: String, required: true, index: true },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
SettingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Setting || mongoose.model<ISetting>('Setting', SettingSchema);
