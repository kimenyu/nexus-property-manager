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
    rentDueDate: {
        type: Date,
        default: function() {
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();
            const targetMonth = (currentMonth + 1) % 12; // Get the next month, considering December
            const targetYear = currentMonth === 11 ? currentYear + 1 : currentYear; // Increment year if December

            return new Date(targetYear, targetMonth, 5);
        }
    },
    type: { type: String, enum: apartmentType, required: true },
});

const Apartment = mongoose.model('Apartment', apartmentSchema);

export default Apartment;