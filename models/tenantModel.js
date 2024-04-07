import mongoose from 'mongoose';

const tenantSchema = new mongoose.Schema({
    firstname: { type: String},
    lastname: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, default: 'Tenant' },
    apartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Apartment', default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isVerified: { type: Boolean, default: false },
    verificationCode: { type: String },
    transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }],
});

const Tenant = mongoose.model('Tenant', tenantSchema);

export default Tenant;