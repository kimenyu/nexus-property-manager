import mongoose from 'mongoose';

const apartmentType = ['studio', '1 bedroom', '2 bedroom', '3 bedroom', '4 bedroom', '5 bedroom', 'penthouse'];

const apartmentSchema = new mongoose.Schema({
    number: { type: String, required: true },
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isAvailable: { type: String, default: true },
    type: { type: String, required: true },
    description: { type: String, required: true },
    rent: { type: Number, required: true },
    deposit: { type: Number, required: true},
    image: { type: String, required: true },
    video: { type: String},
    amenities: [{ type: String, required: true }],
    type: { type: String, enum: apartmentType, required: true },
});

const Apartment = mongoose.model('Apartment', apartmentSchema);

export default Apartment;
