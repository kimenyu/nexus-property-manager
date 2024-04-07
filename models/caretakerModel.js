import mongoose from 'mongoose';

const caretakerSchema = new mongoose.Schema({
    firstname: { type: String, required: true},
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, default: 'caretaker' },
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isVerified: { type: Boolean, default: false },
    verificationCode: { type: String },
    
});

const Caretaker = mongoose.model('Caretaker', caretakerSchema);

export default Caretaker;