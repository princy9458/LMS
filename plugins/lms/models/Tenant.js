import mongoose from 'mongoose';

const TenantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tenant name is required'],
    trim: true
  },
  domain: {
    type: String,
    required: [true, 'Domain/Subdomain is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  plan: {
    type: String,
    enum: ['free', 'pro', 'enterprise'],
    default: 'free'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  settings: {
    primaryColor: { type: String, default: '#6366f1' },
    logoUrl: String,
    customDomain: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Index for fast tenant lookup by domain
TenantSchema.index({ domain: 1 });

export default mongoose.models.Tenant || mongoose.model('Tenant', TenantSchema);
