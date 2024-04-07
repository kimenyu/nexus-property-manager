import mongoose from 'mongoose';

const typeOfProperty = ['apartment', 'house', 'office', 'shop', 'land'];

const propertySchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true },
    apartments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Apartment' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    status: { type: String, default: 'available' },
    propertyType: { type: String, enum: typeOfProperty, required: true },
    description: { type: String, required: true },
    price: { type: Number },
    image: { type: String, required: true },
    location: { type: String, required: true },
    amenities: [{ type: String }],
    rating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
});

const Property = mongoose.model('Property', propertySchema);

export default Property;