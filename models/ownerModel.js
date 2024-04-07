import mongoose from 'mongoose';

const ownerSchema = new mongoose.Schema({
    firstname: { type: String, required: true},
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, default: 'owner' },
    properties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isVerified: { type: Boolean, default: false },
    verificationCode: { type: String },
    
});

const Owner = mongoose.model('Owner', ownerSchema);

export default Owner;